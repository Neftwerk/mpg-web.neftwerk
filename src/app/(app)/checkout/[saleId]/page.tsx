"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { CircleCheck, ShieldCheck } from "lucide-react";
import { MobileMenu } from "@/components/sidebar/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Spinner } from "@/components/Spinner";
import { PinDialog } from "@/components/wallet/PinDialog";
import { useUser } from "@/lib/UserContext";
import { fetchChainConfig } from "@/lib/chain-service";
import { getStellarExplorerTxUrl } from "@/lib/stellar-explorer";
import { decodePayments, useStellarSigner } from "@/lib/stellar-signing";
import {
  buildPayment,
  submitPayment,
  type PurchaseEnvelope,
} from "@/lib/purchase-service";

interface Params {
  saleId: string;
}

/** Cents to a displayable amount. The authoritative figure is the decoded XDR. */
const formatCents = (cents: number) =>
  (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const truncate = (address: string) =>
  /^G[A-Z2-7]{55}$/.test(address)
    ? `${address.slice(0, 7)}…${address.slice(-7)}`
    : address;

/**
 * Where the payment has got to.
 *
 * A failure returns to `review` rather than to `loading`, because a submitted
 * envelope with an unknown outcome must be reused: the retry resends it. Composing
 * again is confined to the two moments it cannot double-pay — before the first
 * submit, and after an expiry, which is proof the transaction never executed.
 */
type Stage = "loading" | "review" | "signing" | "submitting" | "done";

/**
 * Whether a transaction pays what the backend says it pays.
 *
 * The amounts come from the XDR, because that is what gets signed. The backend's
 * `splits` are the same figures recorded separately — so if the two disagree, one of
 * them is wrong and nobody should be signing either.
 *
 * A function rather than a value derived during render, because it has to run twice:
 * once on what is displayed, and again on the envelope composed moments before
 * signing, which no render pass ever saw.
 */
const splitsMatch = (candidate: PurchaseEnvelope, networkPassphrase: string): boolean => {
  const decoded = decodePayments(candidate.xdr, networkPassphrase);
  if (decoded.length !== candidate.splits.length) return false;

  return decoded.every((payment) => {
    const split = candidate.splits.find((s) => s.address === payment.destination);
    if (!split) return false;

    const [whole, fraction = ""] = payment.amount.split(".");
    const cents = Number(`${whole}${fraction.padEnd(2, "0").slice(0, 2)}`);
    return cents === split.amountCents;
  });
};

export default function CheckoutPage({ params }: { params: Promise<Params> }) {
  const { saleId } = use(params);

  const { user, loading: userLoading } = useUser();
  const { authenticated, login } = usePrivy();
  const { signEnvelope } = useStellarSigner();

  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("loading");
  const [envelope, setEnvelope] = useState<PurchaseEnvelope | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * The signature, kept so a failed submit can be retried with it.
   *
   * Retrying must resend the envelope and signature already in hand. Rebuilding
   * takes a fresh sequence number, and against a submission whose outcome is
   * unknown a fresh sequence number is a second payment — so this is what makes
   * retry safe rather than expensive. It is cleared only when the server proves the
   * transaction is dead, which is what `PAYMENT_ENVELOPE_EXPIRED` says.
   *
   * State rather than a ref, because the button label and the retry note are both
   * derived from it: a ref would leave them showing the wrong thing until some
   * other change happened to re-render.
   */
  const [signature, setSignature] = useState<string | null>(null);

  /**
   * The PIN, verified and held for the life of this checkout.
   *
   * A retry has to resend the same envelope, the same signature and the same PIN.
   * Re-prompting would let a typo spend an attempt on a payment that is already
   * signed, and three typos would lock the collector out holding a signature they
   * cannot use — the very failure that checking the PIN before signing avoids.
   *
   * Memory only, never storage, and dropped the moment the payment lands.
   */
  const [pin, setPin] = useState<string | null>(null);
  const [askingPin, setAskingPin] = useState(false);

  /** One compose per mount. React runs effects twice in development. */
  const composed = useRef(false);

  const compose = useCallback(async () => {
    const [built, config] = await Promise.all([
      buildPayment(saleId),
      fetchChainConfig().catch(() => null),
    ]);

    if (!config) {
      setError("We could not read the chain configuration. Please try again.");
      return;
    }
    setPassphrase(config.networkPassphrase);

    if (!built.ok) {
      setError(built.message);
      return;
    }

    setEnvelope(built.data);
    setStage("review");
  }, [saleId]);

  useEffect(() => {
    if (userLoading || !user || composed.current) return;
    composed.current = true;

    // Composing the payment is the external sync this page exists for; it resolves
    // asynchronously, so nothing is set during the render pass.
    void compose();
  }, [compose, user, userLoading]);

  /**
   * Compose, sign and submit, with one silent retry if the envelope ages out.
   *
   * An expired transaction provably never executed, so composing a fresh one and
   * signing it again is the same payment rather than a second one. That makes it the
   * only failure worth recovering from without asking — the collector already
   * approved this payment with their PIN and their signature, and an envelope that
   * lost a race against its own clock is not a decision for them to make again.
   *
   * Two attempts at most. A loop that never gave up would keep signing against a
   * clock it keeps losing to.
   */
  const payWith = useCallback(
    async (verifiedPin: string) => {
      if (!passphrase) return;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        setStage("signing");

        // Composed here rather than signed as loaded. The thirty-minute timebound
        // starts when the envelope is built, and the gap between opening checkout
        // and deciding to pay is unbounded.
        const built = await buildPayment(saleId);
        if (!built.ok) {
          setError(built.message);
          setStage("review");
          return;
        }

        // The render-time check never saw this one, and it is the one being signed.
        if (!splitsMatch(built.data, passphrase)) {
          setError(
            "This payment does not match what we recorded for it. Nothing has been sent.",
          );
          setStage("review");
          return;
        }

        // Shown as well as signed, so the amounts on screen are the amounts approved.
        setEnvelope(built.data);

        let signed: string;
        try {
          signed = await signEnvelope({
            xdr: built.data.xdr,
            address: user!.stellarAddress!,
            networkPassphrase: passphrase,
            // Checked against the hash computed from the XDR itself, so a tampered
            // response cannot obtain a signature over something else.
            expectedHash: built.data.hash,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not sign the payment.");
          setStage("review");
          return;
        }
        setSignature(signed);

        setStage("submitting");
        const result = await submitPayment(saleId, {
          xdr: built.data.xdr,
          signature: signed,
          pin: verifiedPin,
        });

        if (result.ok) {
          setPin(null);
          setTxHash(result.data.txHash);
          setStage("done");
          return;
        }

        // The only code safe to retry on its own. Every other failure may have
        // reached the network, and composing again against one of those could pay
        // twice — so they stop here and the collector decides.
        if (result.code === "PAYMENT_ENVELOPE_EXPIRED") {
          if (attempt === 0) continue;
          // Out of automatic attempts. Drop the signature: it is over bytes the
          // network has refused, so the "already signed, resending is safe" note
          // would be promising a retry that cannot work.
          setSignature(null);
        }

        if (result.code?.startsWith("PIN_")) setPin(null);
        setError(result.message);
        setStage("review");
        return;
      }
    },
    [passphrase, saleId, signEnvelope, user],
  );

  /** Resubmits what is already signed. Composes nothing unless the server proves it must. */
  const send = useCallback(
    async (xdr: string, signature: string, pin: string) => {
      setStage("submitting");
      const result = await submitPayment(saleId, { xdr, signature, pin });

      if (!result.ok) {
        // Expired between the first submit and this one. Nothing executed, so start
        // over rather than resending bytes that are guaranteed to fail.
        if (result.code === "PAYMENT_ENVELOPE_EXPIRED") {
          setSignature(null);
          await payWith(pin);
          return;
        }

        // A PIN failure here means the one in hand is no longer good — changed in
        // another tab, or the lockout caught up. Drop it, so Try again asks for it
        // instead of resending what the server just refused.
        if (result.code?.startsWith("PIN_")) setPin(null);
        // The envelope and signature stay in hand, so Try again resends rather
        // than rebuilding.
        setError(result.message);
        setStage("review");
        return;
      }

      setPin(null);
      setTxHash(result.data.txHash);
      setStage("done");
    },
    [payWith, saleId],
  );

  const onPay = async () => {
    if (!envelope || !passphrase) return;
    setError(null);

    // Already signed, and the submit failed. Resend the same bytes and the same PIN.
    if (signature && pin) {
      await send(envelope.xdr, signature, pin);
      return;
    }

    // The PIN comes first. Signing is the consequential step, and someone who is
    // locked out should learn that before their wallet asks them to approve a spend.
    setAskingPin(true);
  };

  /** PIN → compose → sign → submit. The dialog only resolves with one the backend took. */
  const onPinVerified = async (verified: string) => {
    setAskingPin(false);
    setPin(verified);
    setError(null);

    // Already signed — this was a retry that needed a fresh PIN.
    if (signature && envelope) {
      await send(envelope.xdr, signature, verified);
      return;
    }

    await payWith(verified);
  };

  // What the transaction actually says, read from the envelope rather than from
  // the server's summary of it. `splits` only supplies the labels below.
  const payments =
    envelope && passphrase ? decodePayments(envelope.xdr, passphrase) : [];

  /**
   * Who a payment is going to, matched on the address in the transaction.
   *
   * The backend's roles are `gallery` and `artist`; anything else is shown as-is
   * rather than hidden, because an unrecognised payee on a payment is exactly the
   * thing someone should see before signing.
   */
  const splitFor = (destination: string) =>
    envelope?.splits.find((s) => s.address === destination);

  const labelFor = (role?: string) => {
    if (role === "gallery") return "The gallery";
    if (role === "artist") return "The artist";
    return role ? role[0]!.toUpperCase() + role.slice(1) : "Unrecognised payee";
  };

  /**
   * Whether the transaction pays what the backend says it pays.
   *
   * The amounts shown come from the XDR, because that is what gets signed. The
   * backend's `splits` are the same figures recorded separately — so if the two
   * disagree, one of them is wrong and nobody should be signing either.
   */
  const splitsMatchTransaction =
    envelope !== null && passphrase !== null && splitsMatch(envelope, passphrase);

  return (
    <>
      <PageHeader
        title="Checkout"
        historyBack
        onMenuOpen={() => setMenuOpen(true)}
      />



      <div className="mx-auto mt-20 max-w-2xl space-y-4 p-5 pb-28 lg:mt-0 lg:pb-4">
        {userLoading || (stage === "loading" && !error) ? (
          <div className="card-neumorph flex items-center justify-center gap-3 p-8">
            <Spinner className="h-5 w-5" />
            <p className="text-sm text-[#616161]">Preparing your payment…</p>
          </div>
        ) : !user ? (
          <section className="card-neumorph space-y-4 p-8 text-center">
            <h2 className="text-xl font-semibold text-[#11181c]">
              Log in to complete this purchase
            </h2>
            <a
              href={`/login?redirect=${encodeURIComponent(`/checkout/${saleId}`)}`}
              className="btn-neumorph block w-full text-center"
            >
              Log in
            </a>
          </section>
        ) : stage === "done" ? (
          <section className="card-neumorph space-y-4 p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
              <CircleCheck
                className="h-11 w-11 text-emerald-600"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
            <h2 className="text-xl font-semibold text-[#11181c]">Payment complete</h2>
            <p className="text-sm text-[#616161]">
              Paid from your wallet. The artwork is yours.
            </p>
            {txHash && (
              <a
                href={getStellarExplorerTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#4D91A7] underline"
              >
                View the transaction
              </a>
            )}
            <Link href="/gallery" className="btn-neumorph block w-full text-center">
              Go to my gallery
            </Link>
          </section>
        ) : (
          <>
            {envelope && (
              <section className="card-neumorph space-y-2 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
                  Total
                </p>
                <p className="text-3xl font-semibold text-[#11181c]">
                  ${formatCents(envelope.amountCents)}
                  <span className="ml-2 text-sm font-normal text-[#616161]">USDC</span>
                </p>
                <p className="text-xs text-[#616161]">
                  Paid from your wallet balance in a single transaction.
                </p>
              </section>
            )}

            {payments.length > 0 && (
              <section className="card-neumorph space-y-3 p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#11181c]">
                  <ShieldCheck className="h-5 w-5 text-[#4D91A7]" aria-hidden />
                  What you are signing
                </h2>
                {/* Read out of the transaction, not out of the server's summary of
                    it. Asking someone to approve a payment on our description of
                    it would make the description the thing they trust. */}
                <ul className="divide-y divide-slate-200">
                  {payments.map((payment, index) => {
                    const split = splitFor(payment.destination);

                    return (
                      <li
                        key={`${payment.destination}-${index}`}
                        className="flex items-start justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#11181c]">
                            {labelFor(split?.role)} receives
                          </p>
                          <p
                            className="truncate font-mono text-xs text-[#616161]"
                            title={payment.destination}
                          >
                            {truncate(payment.destination)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#11181c]">
                          ${payment.amount}
                          <span className="ml-1 text-xs font-normal text-[#616161]">
                            {payment.assetCode}
                          </span>
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-[#616161]">
                  Everyone is paid in the same transaction, or nobody is.
                </p>

                {/* The amounts above are decoded from the transaction; the backend
                    recorded the same figures separately when it composed it. If
                    they disagree, one of them is wrong and neither is safe to
                    sign — so this refuses rather than letting the collector
                    choose which to believe. */}
                {!splitsMatchTransaction && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    This transaction does not match the breakdown we recorded for
                    it. Do not approve it — please contact support.
                  </p>
                )}
              </section>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
                {signature && (
                  <p className="mt-1 text-xs">
                    Your payment is already signed. Trying again resends it — it
                    cannot charge you twice.
                  </p>
                )}
              </div>
            )}

            {envelope &&
              (authenticated ? (
                <button
                  type="button"
                  onClick={onPay}
                  disabled={
                    askingPin ||
                    stage === "signing" ||
                    stage === "submitting" ||
                    !splitsMatchTransaction
                  }
                  className="btn-neumorph w-full disabled:opacity-50"
                >
                  {stage === "signing"
                    ? "Purchasing…"
                    : stage === "submitting"
                      ? "Submitting…"
                      : signature
                        ? "Try again"
                        : `Pay $${formatCents(envelope.amountCents)}`}
                </button>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <p>Sign in to your wallet to approve this payment.</p>
                  <button
                    type="button"
                    onClick={() => login()}
                    className="mt-1 underline"
                  >
                    Sign in
                  </button>
                </div>
              ))}

            {!envelope && error && (
              <Link href="/discover" className="btn-neumorph block w-full text-center">
                Back to browsing
              </Link>
            )}
          </>
        )}
      </div>

      {askingPin && (
        <PinDialog
          onResolved={(verified) => void onPinVerified(verified)}
          onCancel={() => setAskingPin(false)}
        />
      )}

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
