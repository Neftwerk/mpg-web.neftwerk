"use client";

import { useState } from "react";
import { formatListPrice } from "@/lib/format";
import { startArtworkCheckout } from "@/lib/payment-service";

interface ArtworkPriceBuyProps {
  artworkId: string;
  listPriceCents: number;
  galleryName?: string;
  compact?: boolean;
  className?: string;
}

export function ArtworkPriceBuy({
  artworkId,
  listPriceCents,
  galleryName,
  compact = false,
  className = "",
}: ArtworkPriceBuyProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const priceLabel = formatListPrice(listPriceCents);
  const canBuy = listPriceCents > 0;

  const handleBuy = async () => {
    if (!canBuy || loading) return;
    setError(null);
    setLoading(true);

    try {
      const result = await startArtworkCheckout({
        artworkId,
        listPriceCents,
        returnPath: `/artwork/${artworkId}`,
        onStatus: setStatus,
      });

      if (!result.ok && !result.cancelled && result.message) {
        setError(result.message);
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

        <button
          type="button"
          onClick={handleBuy}
          disabled={!canBuy || loading}
          className={`btn-neumorph shrink-0 disabled:opacity-50 ${
            compact ? "!px-4 !py-2 text-[13px]" : "!px-8"
          }`}
        >
          {loading ? status ?? "Loading…" : "Buy now"}
        </button>
      </div>

      {error && (
        <p className={`text-red-600 ${compact ? "text-[11px] mt-1" : "text-sm mt-2"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
