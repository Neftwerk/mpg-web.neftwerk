"use client";

import Link from "next/link";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { RegisterOwnershipButton } from "@/components/wallet/RegisterOwnershipButton";
import { OwnedArtworkDates } from "@/components/wallet/OwnedArtworkDates";
import type { OwnedAsset, OwnedAssetMintStatus } from "@/lib/wallet-service";

function mintStatusLabel(status: OwnedAssetMintStatus): string {
  switch (status) {
    case "minted":
      return "Minted";
    case "queued":
      return "Minting";
    case "awaiting_collector":
      return "Claim";
    case "failed":
      return "Mint failed";
    default:
      return "Owned";
  }
}

interface OwnedAssetCardProps {
  asset: OwnedAsset;
  onMintSuccess?: () => void;
  showMintActions?: boolean;
}

export function OwnedAssetCard({
  asset,
  onMintSuccess,
  showMintActions = true,
}: OwnedAssetCardProps) {
  const purchasedAt = asset.purchasedAt ?? asset.acquiredAt;

  return (
    <article className="card-neumorph overflow-hidden">
      <Link href={`/artwork/${asset.artworkId}`} className="block">
        <NeftwerkImage
          src={asset.mediaUrl}
          alt={asset.title}
          className="w-full object-cover"
        />
      </Link>

      <div className="px-3 py-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/artwork/${asset.artworkId}`} className="block min-w-0">
            <p className="text-[13px] font-medium text-[#11181c] line-clamp-2">
              {asset.title}
            </p>
          </Link>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-[#1A3F6C]/10 text-[#1A3F6C] px-2 py-0.5">
            {mintStatusLabel(asset.mintStatus)}
          </span>
        </div>

        {asset.artistName && (
          <p className="text-[11px] text-[#334E57]/70 truncate">{asset.artistName}</p>
        )}

        <div className="flex items-center justify-between gap-2 text-[11px] text-[#334E57]/60">
          <span className="truncate">{asset.galleryName ?? asset.collectionName ?? "Collection"}</span>
        </div>

        <OwnedArtworkDates
          purchasedAt={purchasedAt}
          mintStatus={asset.mintStatus}
          claimedAt={asset.claimedAt}
          variant="compact"
        />

        {showMintActions && (
          <RegisterOwnershipButton
            saleId={asset.saleId}
            title={asset.title}
            mintStatus={asset.mintStatus}
            onSuccess={onMintSuccess}
          />
        )}
      </div>
    </article>
  );
}
