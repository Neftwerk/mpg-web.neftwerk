"use client";

import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPaymentPinStatus,
  requestPinReset,
  resetPaymentPin,
  setPaymentPin,
  verifyPaymentPin,
} from "@/lib/collector-service";

/**
 * Which question the dialog is asking.
 *
 * `create` is reachable from checkout on purpose: a collector who has never set a
 * PIN must be able to set one where they stand. Sending them to settings would
 * abandon the payment they were making.
 */
type Mode = "enter" | "create" | "change" | "reset";

const PIN_LENGTH = 4;
/**
 * The emailed reset code stays six digits.
 *
 * It is not a PIN: single use, fifteen minutes, three tries, and nobody memorises
 * it — so shortening it would cost security and buy no convenience.
 */
const OTP_LENGTH = 6;

const blank = (length: number) => Array.from({ length }, () => "");

/**
 * Six boxes, with the paste and backspace behaviour the login code already uses.
 *
 * `masked` is the difference between the two things this dialog asks for: a PIN is
 * a standing secret and is dotted, an emailed code is single-use and is shown, so
 * someone reading it off their phone can see they typed it correctly.
 */
function Digits({
  value,
  onChange,
  masked = false,
  disabled = false,
  autoFocus = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  masked?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const length = value.length;
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const set = (index: number, digit: string) => {
    const next = [...value];
    next[index] = digit.replace(/\D/g, "").slice(-1);
    onChange(next);
    if (next[index] && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => set(index, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[index] && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={
            index === 0
              ? (e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData
                    .getData("text")
                    .replace(/\D/g, "")
                    .slice(0, length);
                  if (!pasted) return;
                  const next = blank(length);
                  for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
                  onChange(next);
                  refs.current[Math.min(pasted.length, length - 1)]?.focus();
                }
              : undefined
          }
          className="h-12 w-10 rounded-none border border-slate-300 bg-white text-center text-xl font-semibold outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400 sm:h-14 sm:w-12"
        />
      ))}
    </div>
  );
}

/**
 * Render this conditionally rather than passing an `open` flag: mounting is what
 * gives each appearance clean state, so a cancelled entry leaves no half-typed PIN
 * behind for the next one.
 */
export function PinDialog({
  intent = "pay",
  onResolved,
  onCancel,
}: {
  /**
   * What the caller wants. The dialog still reads the account to decide what it can
   * actually ask: someone with no PIN gets `create` whichever intent was passed,
   * because there is nothing to change yet.
   */
  intent?: "pay" | "change";
  /**
   * The PIN, already accepted by the backend.
   *
   * Handed back rather than kept here because the caller has to send it with the
   * request it is guarding — the submit checks it again, and that check is the one
   * that actually protects the money.
   */
  onResolved: (pin: string) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<Mode>("enter");
  const [ready, setReady] = useState(false);
  const [pin, setPin] = useState<string[]>(blank(PIN_LENGTH));
  /** The PIN being replaced. Only `change` asks for it. */
  const [current, setCurrent] = useState<string[]>(blank(PIN_LENGTH));
  const [confirm, setConfirm] = useState<string[]>(blank(PIN_LENGTH));
  const [otp, setOtp] = useState<string[]>(blank(OTP_LENGTH));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** A lockout closes the inputs; only the reset path leads anywhere from here. */
  const [locked, setLocked] = useState(false);
  /** Bumped on a mismatch to remount the digit rows, which returns focus to the first. */
  const [attempt, setAttempt] = useState(0);
  /**
   * Unmasks the PIN rows.
   *
   * Off by default, and worth more on the payment prompt than during setup: with
   * three attempts before a fifteen-minute lockout, checking what you typed before
   * submitting is cheaper than being wrong.
   */
  const [reveal, setReveal] = useState(false);

  const reset = useCallback(() => {
    setPin(blank(PIN_LENGTH));
    setCurrent(blank(PIN_LENGTH));
    setConfirm(blank(PIN_LENGTH));
    setOtp(blank(OTP_LENGTH));
    setError(null);
    setNotice(null);
    setBusy(false);
    setLocked(false);
    setReveal(false);
  }, []);

  // Which question to ask is a fact about the account, so it is read before the
  // inputs paint rather than after — otherwise someone with no PIN is asked for
  // one, and the prompt changes under them a moment later.
  useEffect(() => {
    let live = true;

    void getPaymentPinStatus().then((result) => {
      if (!live) return;
      // A failed read is not an answer, and both `enter` and `change` recover from a
      // wrong guess: if they turn out to have no PIN, the call returns PIN_NOT_SET
      // and `fail` switches to `create`. Guessing `create` for someone who already
      // has one strands them — the backend asks for their current PIN and neither of
      // those screens would have a field for it.
      const has = result.ok ? result.data.isSet : true;
      setMode(has ? (intent === "change" ? "change" : "enter") : "create");
      setReady(true);
    });

    return () => {
      live = false;
    };
  }, [intent]);

  const join = (digits: string[]) => digits.join("");
  const complete = (digits: string[]) => join(digits).length === digits.length;

  /** Every failure lands here, so the lockout is handled in exactly one place. */
  const fail = (message: string, code?: string) => {
    if (code === "PIN_LOCKED") setLocked(true);
    if (code === "PIN_NOT_SET") setMode("create");
    setError(message);
    setPin(blank(PIN_LENGTH));
    setConfirm(blank(PIN_LENGTH));
  };

  const submitEnter = async () => {
    setBusy(true);
    setError(null);
    const entered = join(pin);
    const result = await verifyPaymentPin(entered);
    setBusy(false);
    if (!result.ok) return fail(result.message, result.code);
    onResolved(entered);
  };

  /**
   * Both rows clear, and the collector enters the PIN and confirms it again.
   *
   * Clearing only the confirmation assumes the typo was there. If it was in the
   * original, that row is left looking finished while holding digits they never
   * meant — and every careful retype mismatches again.
   */
  const mismatch = () => {
    setPin(blank(PIN_LENGTH));
    setConfirm(blank(PIN_LENGTH));
    setAttempt((n) => n + 1);
    setError("Those did not match. Enter your PIN again, then confirm it.");
  };

  const submitCreate = async () => {
    if (join(pin) !== join(confirm)) return mismatch();
    setBusy(true);
    setError(null);
    const chosen = join(pin);
    const result = await setPaymentPin({ pin: chosen });
    setBusy(false);
    if (!result.ok) return fail(result.message, result.code);
    onResolved(chosen);
  };

  const submitChange = async () => {
    if (join(pin) !== join(confirm)) return mismatch();
    setBusy(true);
    setError(null);
    const chosen = join(pin);
    const result = await setPaymentPin({ pin: chosen, currentPin: join(current) });
    setBusy(false);
    if (!result.ok) {
      // The current PIN is what was rejected, so that row clears too — `fail` only
      // knows about the pair being chosen.
      setCurrent(blank(PIN_LENGTH));
      return fail(result.message, result.code);
    }
    onResolved(chosen);
  };

  const submitReset = async () => {
    if (join(pin) !== join(confirm)) return mismatch();
    setBusy(true);
    setError(null);
    const chosen = join(pin);
    const result = await resetPaymentPin({ otp: join(otp), pin: chosen });
    setBusy(false);
    if (!result.ok) {
      setOtp(blank(OTP_LENGTH));
      return fail(result.message, result.code);
    }
    onResolved(chosen);
  };

  const startReset = async () => {
    setBusy(true);
    setError(null);
    const result = await requestPinReset();
    setBusy(false);
    if (!result.ok) return fail(result.message, result.code);
    reset();
    setMode("reset");
    setNotice("We've emailed you a six-digit code.");
  };

  const heading =
    mode === "enter"
      ? "Enter your payment PIN"
      : mode === "create"
        ? "Create a payment PIN"
        : mode === "change"
          ? "Change your payment PIN"
          : "Set a new PIN";

  const blurb =
    mode === "enter"
      ? "This confirms the payment before your wallet is asked to sign."
      : mode === "create"
        ? "Four digits. You'll enter it whenever money leaves your wallet."
        : mode === "change"
          ? "Enter your current PIN, then choose a new one."
          : "Enter the code we emailed you, then choose a new PIN.";

  const canSubmit =
    !busy &&
    !locked &&
    complete(pin) &&
    (mode === "enter" || complete(confirm)) &&
    (mode !== "change" || complete(current)) &&
    (mode !== "reset" || complete(otp));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      <div className="card-neumorph w-full max-w-md bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
        <p className="mt-1 text-sm text-slate-600">{blurb}</p>

        {!ready ? (
          <p className="mt-6 text-center text-sm text-slate-400">One moment…</p>
        ) : (
          <div className="mt-6 space-y-5">
            {mode === "reset" && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Emailed code
                </p>
                <Digits value={otp} onChange={setOtp} disabled={busy} autoFocus />
              </div>
            )}

            {mode === "change" && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Current PIN
                </p>
                <Digits
                  value={current}
                  onChange={setCurrent}
                  masked={!reveal}
                  disabled={busy || locked}
                  autoFocus={attempt === 0}
                />
              </div>
            )}

            <div className="space-y-2">
              {mode !== "enter" && (
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  New PIN
                </p>
              )}
              <Digits
                key={`pin-${attempt}`}
                value={pin}
                onChange={setPin}
                masked={!reveal}
                disabled={busy || locked}
                // After a mismatch the first PIN row takes focus even in reset
                // mode, where the emailed code would otherwise hold it.
                autoFocus={attempt > 0 || (mode !== "reset" && mode !== "change")}
              />
            </div>

            {mode !== "enter" && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Confirm
                </p>
                <Digits
                  key={`confirm-${attempt}`}
                  value={confirm}
                  onChange={setConfirm}
                  masked={!reveal}
                  disabled={busy || locked}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setReveal((shown) => !shown)}
              className="mx-auto flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              {reveal ? (
                <EyeOff className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Eye className="h-3.5 w-3.5" aria-hidden />
              )}
              {reveal ? "Hide" : "Show"}
            </button>

            {notice && <p className="text-sm text-emerald-700">{notice}</p>}
            {error && (
              <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                if (mode === "enter") void submitEnter();
                else if (mode === "create") void submitCreate();
                else if (mode === "change") void submitChange();
                else void submitReset();
              }}
              className="btn-neumorph w-full disabled:opacity-50"
            >
              {busy ? "Checking…" : mode === "enter" ? "Confirm" : "Save PIN"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              {mode !== "create" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void startReset()}
                  className="font-medium text-sky-900 underline underline-offset-2 hover:text-sky-700 disabled:opacity-50"
                >
                  {mode === "reset" ? "Send a new code" : "Forgot your PIN?"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
