"use client";

import { useCallback, useEffect, useState } from "react";
import {
  parseCoinflowCheckoutMessage,
  withCoinflowHeightParam,
} from "@/lib/coinflow-messages";

interface CoinflowCheckoutModalProps {
  isOpen: boolean;
  checkoutUrl: string | null;
  onClose: () => void;
  onSuccess?: (paymentId?: string) => void;
}

const DEFAULT_HEIGHT_PX = 560;

export function CoinflowCheckoutModal({
  isOpen,
  checkoutUrl,
  onClose,
  onSuccess,
}: CoinflowCheckoutModalProps) {
  const [heightPx, setHeightPx] = useState(DEFAULT_HEIGHT_PX);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const parsed = parseCoinflowCheckoutMessage(event.data, event.origin);
      if (!parsed) return;

      if (parsed.type === "heightChange") {
        setHeightPx(parsed.heightPx);
        return;
      }

      if (parsed.type === "cancel") {
        onClose();
        return;
      }

      if (parsed.type === "success") {
        onSuccess?.(parsed.paymentId);
      }
    },
    [onClose, onSuccess],
  );

  useEffect(() => {
    if (!isOpen) return;

    setHeightPx(DEFAULT_HEIGHT_PX);

    window.addEventListener("message", handleMessage);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("message", handleMessage);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleMessage, isOpen]);

  if (!isOpen || !checkoutUrl) return null;

  const iframeSrc = withCoinflowHeightParam(checkoutUrl);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        key={checkoutUrl}
        className="relative flex w-full max-w-lg flex-col bg-white shadow-xl sm:rounded-lg max-h-[calc(100dvh-0.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coinflow-checkout-title"
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 id="coinflow-checkout-title" className="text-sm font-semibold text-[#1A3F6C]">
            Complete purchase
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-xl leading-none px-2"
            aria-label="Close checkout"
          >
            ×
          </button>
        </div>

        {/* Coinflow docs: wrapper height = message.data + "px"; iframe fills wrapper at 100%. */}
        <div className="w-full shrink-0" style={{ height: `${heightPx}px` }}>
          <iframe
            title="Coinflow checkout"
            src={iframeSrc}
            allow="payment *; publickey-credentials-get *; geolocation"
            scrolling="no"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
