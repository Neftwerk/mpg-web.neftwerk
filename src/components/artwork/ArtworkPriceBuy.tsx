"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatListPrice } from "@/lib/format";
import { getAccessToken } from "@/lib/auth-service";
import { startArtworkCheckout } from "@/lib/payment-service";
import { CoinflowCheckoutModal } from "@/components/payments/CoinflowCheckoutModal";
import { LinkSuccessModal } from "@/components/LinkSuccessModal";

interface ArtworkPriceBuyProps {
  artworkId: string;
  listPriceCents?: number | null;
  artworkTitle?: string;
  galleryName?: string;
  compact?: boolean;
  className?: string;
}

export function ArtworkPriceBuy({
  artworkId,
  listPriceCents,
  artworkTitle,
  galleryName,
  compact = false,
  className = "",
}: ArtworkPriceBuyProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const priceLabel = formatListPrice(listPriceCents);
  const canBuy = (listPriceCents ?? 0) > 0;
  const enquireHref = (() => {
    const params = new URLSearchParams({ artworkId });
    if (artworkTitle) params.set("artwork", artworkTitle);
    return `/messages?${params.toString()}`;
  })();
  const actionClassName = `btn-neumorph shrink-0 ${
    compact ? "!px-4 !py-2 text-[13px]" : "!px-8"
  }`;

  const handleBuy = async () => {
    if (!canBuy || loading) return;
    const priceCents = listPriceCents;
    if (priceCents == null || priceCents <= 0) return;

    setError(null);
    setLoading(true);

    try {
      const result = await startArtworkCheckout({
        artworkId,
        listPriceCents: priceCents,
        returnPath: `/artwork/${artworkId}`,
        onStatus: setStatus,
      });

      if (!result.ok && !result.cancelled && result.message) {
        setError(result.message);
        return;
      }

      if (result.checkoutLink) {
        setCheckoutLink(result.checkoutLink);
      }
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

        {canBuy ? (
          <button
            type="button"
            onClick={handleBuy}
            disabled={loading}
            className={`${actionClassName} disabled:opacity-50`}
          >
            {loading ? status ?? "Loading…" : "Buy now"}
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
            Enquire
          </button>
        )}
      </div>

      {error && (
        <p className={`text-red-600 ${compact ? "text-[11px] mt-1" : "text-sm mt-2"}`}>
          {error}
        </p>
      )}

      <CoinflowCheckoutModal
        isOpen={Boolean(checkoutLink)}
        checkoutUrl={checkoutLink}
        onClose={() => setCheckoutLink(null)}
        onSuccess={() => {
          setCheckoutLink(null);
          setPurchaseComplete(true);
        }}
      />

      <LinkSuccessModal
        isOpen={purchaseComplete}
        onClose={() => setPurchaseComplete(false)}
        kind="artwork"
      />
    </div>
  );
}
