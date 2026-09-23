"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatListPrice } from "@/lib/format";

interface InsufficientFundsModalProps {
  open: boolean;
  onClose: () => void;
  /** What the work costs. */
  priceCents: number;
  /** What the wallet holds, in cents, for the shortfall line. */
  balanceCents?: number;
}

/**
 * Shown when a purchase is stopped because the wallet cannot cover the price.
 *
 * This used to be a line of small red text under the price, which is easy to
 * miss and says nothing about what to do next. Being stopped mid-purchase is
 * worth interrupting for, and the way out — add funds — belongs in the
 * interruption rather than somewhere the collector has to go looking.
 */
export function InsufficientFundsModal({
  open,
  onClose,
  priceCents,
  balanceCents,
}: InsufficientFundsModalProps) {
  const primaryRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Focus the way forward, and stop the page behind from scrolling under it.
    primaryRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const shortfallCents =
    balanceCents === undefined ? null : Math.max(priceCents - balanceCents, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="insufficient-funds-title"
        className="relative w-full max-w-sm bg-[#F2F3F7] p-7 text-center shadow-[0_24px_56px_rgba(17,24,28,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center bg-[#4D91A7]/10 text-[#4D91A7]">
            <Wallet className="h-7 w-7" aria-hidden />
          </span>
        </div>

        <h2
          id="insufficient-funds-title"
          className="text-lg font-extrabold tracking-tight text-[#1A3F6C]"
        >
          Not enough funds
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#616161]">
          You need {formatListPrice(priceCents)} in your wallet to buy this. Add
          funds and come back.
        </p>

        {shortfallCents !== null && (
          <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            <div className="flex items-center justify-between py-2">
              <dt className="text-[#616161]">Your balance</dt>
              <dd className="font-medium text-[#11181c]">
                {formatListPrice(balanceCents)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-[#616161]">Still needed</dt>
              <dd className="font-bold text-[#1A3F6C]">
                {formatListPrice(shortfallCents)}
              </dd>
            </div>
          </dl>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            ref={primaryRef}
            href="/wallet"
            className="btn-neumorph w-full justify-center"
          >
            Add funds
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-[#616161] underline underline-offset-4"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
