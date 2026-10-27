"use client";

import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth-service";

/*
 * ─── Purchasing, switched off ───
 *
 * Artworks are enquiry-only for now: every work shows "On request" and routes to
 * the gallery instead of to checkout. Kept here rather than deleted so it can be
 * switched back on. `/checkout/[saleId]` and the payment PIN behind it are
 * untouched and still work once a sale exists — this is the only entry point that
 * is gone, so nothing reaches them from browsing while this is commented out.
 *
 * This block is the version with the insufficient-funds modal, which superseded an
 * inline "you need $X in your wallet" message. `InsufficientFundsModal` is still in
 * the tree and is referenced only from here, so it will look unused until this is
 * switched back on — do not delete it on that basis.
 *
 * To restore: uncomment this block, add `listPriceCents` back to the destructured
 * props, and put the `canBuy` branch and the modal back in the markup where they
 * are marked below.
 *
 * import { useState } from "react";
 * import { formatListPrice } from "@/lib/format";
 * import { getCollectorWallet } from "@/lib/collector-service";
 * import { startCheckout } from "@/lib/purchase-service";
 * import { InsufficientFundsModal } from "@/components/artwork/InsufficientFundsModal";
 *
 * // A USDC balance to whole cents, flooring sub-cent dust. String arithmetic
 * // rather than `Number(balance) * 100`: Horizon reports seven decimal places, and
 * // float multiplication would put a check on someone's own money on the wrong
 * // side of a rounding error. Mirrors the backend's own conversion.
 * const usdcToCents = (amount: string): number => {
 *   const [whole, fraction = ""] = amount.split(".");
 *   return Number(`${whole}${fraction.padEnd(2, "0").slice(0, 2)}`);
 * };
 *
 * const [loading, setLoading] = useState(false);
 * const [error, setError] = useState<string | null>(null);
 * const [status, setStatus] = useState<string | null>(null);
 * // Set only when the wallet cannot cover the price; drives the modal.
 * const [shortfall, setShortfall] = useState<{
 *   priceCents: number;
 *   balanceCents: number;
 * } | null>(null);
 * const priceLabel = formatListPrice(listPriceCents);
 * const canBuy = !sold && (listPriceCents ?? 0) > 0;
 *
 * const handleBuy = async () => {
 *   if (!canBuy || loading) return;
 *   const priceCents = listPriceCents;
 *   if (priceCents == null || priceCents <= 0) return;
 *
 *   if (!getAccessToken()) {
 *     router.push(`/login?redirect=${encodeURIComponent(`/artwork/${artworkId}`)}`);
 *     return;
 *   }
 *
 *   setError(null);
 *   setShortfall(null);
 *   setLoading(true);
 *
 *   try {
 *     // Checked before the sale is created, not after. Composing the payment would
 *     // fail anyway, but only once a pending sale existed — leaving the collector
 *     // with a checkout they cannot finish and us with a row that means nothing.
 *     setStatus("Checking your balance…");
 *     const wallet = await getCollectorWallet();
 *
 *     if (!wallet.ok) {
 *       setError("We couldn't read your wallet. Please try again.");
 *       return;
 *     }
 *
 *     if (!wallet.data.address || !wallet.data.hasUsdcTrustline) {
 *       setError("Set up your wallet before buying — it takes a minute.");
 *       return;
 *     }
 *
 *     const balanceCents = usdcToCents(wallet.data.usdcBalance);
 *     if (balanceCents < priceCents) {
 *       // Being stopped here is the one failure worth interrupting for: it has a
 *       // clear way out. The rest stay as inline text next to the button.
 *       setShortfall({ priceCents, balanceCents });
 *       return;
 *     }
 *
 *     setStatus("Starting checkout…");
 *     const sale = await startCheckout(artworkId);
 *     if (!sale.ok) {
 *       setError(sale.message);
 *       return;
 *     }
 *
 *     // The payment itself is composed and signed on the checkout page. A page
 *     // rather than a modal because the server persists the envelope it builds, so
 *     // a reload part-way through has to resume that one rather than start another.
 *     router.push(`/checkout/${sale.data.saleId}`);
 *   } catch (err) {
 *     console.error("[Buy] checkout failed:", err);
 *     setError(
 *       err instanceof Error
 *         ? err.message
 *         : "Something went wrong. Please try again.",
 *     );
 *   } finally {
 *     setStatus(null);
 *     setLoading(false);
 *   }
 * };
 */

interface ArtworkPriceBuyProps {
  artworkId: string;
  /** Unused while purchasing is off. Callers still pass it; the buy path reads it. */
  listPriceCents?: number | null;
  artworkTitle?: string;
  galleryName?: string;
  sold?: boolean;
  compact?: boolean;
  className?: string;
}

export function ArtworkPriceBuy({
  artworkId,
  artworkTitle,
  galleryName,
  sold = false,
  compact = false,
  className = "",
}: ArtworkPriceBuyProps) {
  const router = useRouter();

  const enquireHref = (() => {
    const params = new URLSearchParams({ artworkId });
    if (artworkTitle) params.set("artwork", artworkTitle);
    return `/messages?${params.toString()}`;
  })();

  const actionClassName = `btn-neumorph shrink-0 ${
    compact ? "!px-3 !py-2 text-[11px] leading-tight max-w-[9.5rem] text-center whitespace-normal" : "!px-8"
  }`;
  const soldClassName = `shrink-0 cursor-not-allowed bg-red-600 text-white font-semibold rounded-md ${
    compact ? "px-4 py-2 text-[13px]" : "px-8 py-3 text-[15px]"
  }`;

  return (
    <div className={className}>
      <div
        className={`flex items-center justify-between gap-3 ${
          compact ? "mt-1" : "mt-0"
        }`}
      >
        <div className="min-w-0">
          {galleryName && (
            <p className="text-[11px] uppercase tracking-wider text-[#334E57]/60 truncate">
              {galleryName}
            </p>
          )}
          {/* Deliberately the smallest thing in this row. At 22px bold it competed
              with the button for the same line and ran into it on narrow screens —
              and it is a status, not a figure, so it should not read like one. */}
          <p className="text-[9px] uppercase tracking-wide text-[#334E57]/70 whitespace-nowrap">
            On request
          </p>
        </div>

        {/* The `canBuy` branch went here — see the block at the top of this file. */}
        {sold ? (
          <button type="button" disabled className={soldClassName} aria-label="Sold">
            Sold
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!getAccessToken()) {
                router.push("/login");
                return;
              }
              router.push(enquireHref);
            }}
            className={actionClassName}
          >
            Message the gallery
          </button>
        )}
      </div>

      {/* The inline error and <InsufficientFundsModal> went here — both belong to
          the buy path in the block at the top of this file. */}
    </div>
  );
}
