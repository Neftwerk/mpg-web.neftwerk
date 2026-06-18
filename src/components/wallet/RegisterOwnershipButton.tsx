"use client";

import { useState } from "react";
import { registerSaleOwnership } from "@/lib/mint-service";
import type { OwnedAssetMintStatus } from "@/lib/wallet-service";

type Props = {
  saleId: string;
  title: string;
  mintStatus: OwnedAssetMintStatus;
  onSuccess?: () => void;
};

export function RegisterOwnershipButton({ saleId, title, mintStatus, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRegister = mintStatus === "awaiting_collector" || mintStatus === "failed";

  if (!canRegister) return null;

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await registerSaleOwnership(saleId);
      if (!result.ok) {
        if (!result.cancelled) {
          setError(result.message);
        }
        return;
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register ownership failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-neumorph w-full !py-2 !text-[12px] disabled:opacity-60"
        aria-label={`Register ownership for ${title}`}
      >
        {loading ? "Connecting wallet…" : "Register ownership"}
      </button>
      {error && <p className="text-[11px] text-red-600 leading-snug">{error}</p>}
    </div>
  );
}
