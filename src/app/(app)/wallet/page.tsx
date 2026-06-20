"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { GalleryGridSkeleton } from "@/components/Skeletons";
import { useUser } from "@/lib/UserContext";
import {
  fetchOwnedAssets,
  type OwnedAsset,
  type OwnedAssetMintStatus,
} from "@/lib/wallet-service";
import { RegisterOwnershipButton } from "@/components/wallet/RegisterOwnershipButton";
import { OwnedArtworkDates } from "@/components/wallet/OwnedArtworkDates";

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

function OwnedAssetCard({
  asset,
  onMintSuccess,
}: {
  asset: OwnedAsset;
  onMintSuccess: () => void;
}) {
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
          <span className="truncate">{asset.collectionName ?? "Collection"}</span>
        </div>

        <OwnedArtworkDates
          purchasedAt={purchasedAt}
          mintStatus={asset.mintStatus}
          claimedAt={asset.claimedAt}
          variant="compact"
        />

        <RegisterOwnershipButton
          saleId={asset.saleId}
          title={asset.title}
          mintStatus={asset.mintStatus}
          onSuccess={onMintSuccess}
        />
      </div>
    </article>
  );
}

export default function WalletPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [assets, setAssets] = useState<OwnedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useUser();

  const reloadAssets = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetchOwnedAssets()
      .then(setAssets)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load your collection.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setAssets([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchOwnedAssets()
      .then((items) => {
        if (!cancelled) setAssets(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your collection.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, userLoading]);

  return (
    <>
      <MobileTopBar title="Wallet" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Wallet</h1>
          <p className="text-sm text-slate-500 mt-1">
            Artworks you purchased or claimed
          </p>
        </div>
      </header>

      <div className="p-4 pb-36 mt-20 lg:mt-0 lg:pb-4">
        <p className="lg:hidden text-sm text-[#616161] mb-4">
          Artworks you purchased or claimed
        </p>

        {!userLoading && !user && (
          <div className="card-neumorph p-6 text-center space-y-4">
            <p className="text-sm text-[#464646]">
              Sign in to see artworks you bought or claimed.
            </p>
            <Link
              href="/login?redirect=/wallet"
              className="btn-neumorph inline-block !px-8"
            >
              Sign in
            </Link>
          </div>
        )}

        {user && error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {user && loading && <GalleryGridSkeleton count={4} />}

        {user && !loading && !error && assets.length === 0 && (
          <div className="card-neumorph p-6 text-center space-y-4">
            <p className="text-sm text-[#464646]">
              You do not own any artworks yet.
            </p>
            <Link href="/gallery" className="btn-neumorph inline-block !px-8">
              Browse gallery
            </Link>
          </div>
        )}

        {user && !loading && assets.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <OwnedAssetCard key={asset.saleId} asset={asset} onMintSuccess={reloadAssets} />
            ))}
          </div>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
