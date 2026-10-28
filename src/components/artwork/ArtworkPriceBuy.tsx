"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatListPrice } from "@/lib/format";
import { getAccessToken } from "@/lib/auth-service";
import { getCollectorWallet } from "@/lib/collector-service";
import { startCheckout } from "@/lib/purchase-service";
import { InsufficientFundsModal } from "@/components/artwork/InsufficientFundsModal";

/**
 * A USDC balance to whole cents, flooring sub-cent dust.
 *
 * String arithmetic rather than `Number(balance) * 100`: Horizon reports seven
 * decimal places, and float multiplication would put a check on someone's own money
 * on the wrong side of a rounding error. Mirrors the backend's own conversion, so
 * the two cannot disagree about whether a balance covers a price.
 */
const usdcToCents = (amount: string): number => {
  const [whole, fraction = ""] = amount.split(".");
  return Number(`${whole}${fraction.padEnd(2, "0").slice(0, 2)}`);
};

interface ArtworkPriceBuyProps {
  artworkId: string;
  listPriceCents?: number | null;
  artworkTitle?: string;
  galleryName?: string;
  sold?: boolean;
  compact?: boolean;
  className?: string;
}

export function ArtworkPriceBuy({
  artworkId,
  listPriceCents,
  artworkTitle,
  galleryName,
  sold = false,
  compact = false,
  className = "",
}: ArtworkPriceBuyProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  /** Set only when the wallet cannot cover the price; drives the modal. */
  const [shortfall, setShortfall] = useState<{
    priceCents: number;
    balanceCents: number;
  } | null>(null);
  const priceLabel = formatListPrice(listPriceCents);
  const canBuy = !sold && (listPriceCents ?? 0) > 0;
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

  const handleBuy = async () => {
    if (!canBuy || loading) return;
    const priceCents = listPriceCents;
    if (priceCents == null || priceCents <= 0) return;

    if (!getAccessToken()) {
      router.push(`/login?redirect=${encodeURIComponent(`/artwork/${artworkId}`)}`);
      return;
    }

    setError(null);
    setShortfall(null);
    setLoading(true);

    try {
      // Checked before the sale is created, not after. Composing the payment would
      // fail anyway, but only once a pending sale existed — leaving the collector
      // with a checkout they cannot finish and us with a row that means nothing.
      setStatus("Checking your balance…");
      const wallet = await getCollectorWallet();

      if (!wallet.ok) {
        setError("We couldn't read your wallet. Please try again.");
        return;
      }

      if (!wallet.data.address || !wallet.data.hasUsdcTrustline) {
        setError("Set up your wallet before buying — it takes a minute.");
        return;
      }

      const balanceCents = usdcToCents(wallet.data.usdcBalance);
      if (balanceCents < priceCents) {
        // Being stopped here is the one failure worth interrupting for: it has a
        // clear way out. The rest stay as inline text next to the button.
        setShortfall({ priceCents, balanceCents });
        return;
      }

      setStatus("Starting checkout…");
      const sale = await startCheckout(artworkId);
      if (!sale.ok) {
        setError(sale.message);
        return;
      }

      // The payment itself is composed and signed on the checkout page. A page
      // rather than a modal because the server persists the envelope it builds, so
      // a reload part-way through has to resume that one rather than start another.
      router.push(`/checkout/${sale.data.saleId}`);
    } catch (err) {
      console.error("[Buy] checkout failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setStatus(null);
      setLoading(false);
    }
  };

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
          <p
            className={`font-bold text-[#1A3F6C] ${
              compact ? "text-[14px]" : "text-[22px]"
            }`}
          >
            {priceLabel}
          </p>
        </div>

        {sold ? (
          <button type="button" disabled className={soldClassName} aria-label="Sold">
            Sold
          </button>
        ) : canBuy ? (
          <button
            type="button"
            onClick={handleBuy}
            disabled={loading}
            className={`${actionClassName} disabled:opacity-50`}
          >
            {loading ? status ?? "Loading…" : "Purchase "}
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

      {error && (
        <p className={`text-red-600 ${compact ? "text-[11px] mt-1" : "text-sm mt-2"}`}>
          {error}
        </p>
      )}

      <InsufficientFundsModal
        open={shortfall !== null}
        onClose={() => setShortfall(null)}
        priceCents={shortfall?.priceCents ?? 0}
        balanceCents={shortfall?.balanceCents}
      />
    </div>
  );
}
