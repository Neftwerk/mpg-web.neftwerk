"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { fetchPublicArtwork, ArtworkDetail } from "@/lib/gallery-service";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { ArtworkDetailSkeleton } from "@/components/Skeletons";
import { ArtworkPriceBuy } from "@/components/artwork/ArtworkPriceBuy";
import { RegisterOwnershipButton } from "@/components/wallet/RegisterOwnershipButton";
import { OwnedArtworkDates } from "@/components/wallet/OwnedArtworkDates";
import { formatListPrice } from "@/lib/format";
import { useUser } from "@/lib/UserContext";
import {
  fetchOwnedAssetForArtwork,
  type OwnedAsset,
  type OwnedAssetMintStatus,
} from "@/lib/wallet-service";

type Params = { id: string };

function ownedStatusLabel(status: OwnedAssetMintStatus): string {
  switch (status) {
    case "minted":
      return "Minted";
    case "queued":
      return "Minting";
    case "awaiting_collector":
      return "Claim pending";
    case "failed":
      return "Mint failed";
    default:
      return "In your wallet";
  }
}

export default function ArtworkPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const { user, loading: userLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [ownedAsset, setOwnedAsset] = useState<OwnedAsset | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicArtwork(id);
        if (!data) {
          setError("Artwork not found.");
        } else {
          setArtwork(data);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (userLoading || !user) {
      setOwnedAsset(null);
      setOwnershipLoading(false);
      return;
    }

    let cancelled = false;
    setOwnershipLoading(true);

    fetchOwnedAssetForArtwork(id)
      .then((asset) => {
        if (!cancelled) setOwnedAsset(asset);
      })
      .catch(() => {
        if (!cancelled) setOwnedAsset(null);
      })
      .finally(() => {
        if (!cancelled) setOwnershipLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, user, userLoading]);

  const isOwned = Boolean(ownedAsset);
  const showBuy = !isOwned && (!user || !ownershipLoading);

  const title = artwork?.title ?? `Artwork #${id}`;
  const artist = artwork?.artist?.fullName ?? "Unknown Artist";
  const description =
    artwork?.description ??
    "This piece reimagines a familiar motif through contemporary materials and scale.";
  const imageUrl = artwork?.mediaUrl ?? "/images/art1.png";
  const priceLabel = formatListPrice(artwork?.listPriceCents);
  const royaltyPercent = artwork?.royaltyBps
    ? `${(artwork.royaltyBps / 100).toFixed(1)}%`
    : null;

  return (
    <>
      <MobileTopBar
        title="Artwork Details"
        onMenuOpen={() => setMenuOpen(true)}
      />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4 mt-20 lg:mt-0">
        <h1 className="text-xl font-semibold text-slate-900">
          Artwork Details
        </h1>
      </header>

      <div className="p-5 pb-36 mt-20 lg:mt-0">
        {loading && <ArtworkDetailSkeleton />}

        {!loading && !artwork && (
          <div className="text-center py-16">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              {error ?? "Artwork not found."}
            </p>
          </div>
        )}

        {!loading && artwork && (
          <>
            <div className="card-neumorph p-3 bg-white mb-6">
              <NeftwerkImage
                src={imageUrl}
                alt={title}
                className="w-full object-cover aspect-[4/3]"
                priority
                onError={(e) => {
                  e.currentTarget.src =
                    "https://picsum.photos/seed/fallback/800/600";
                }}
              />
            </div>

            <h2 className="text-[19px] font-bold text-[#1A3F6C] mb-4">
              {title}
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-[46px] w-[46px] rounded-full border-[2px] border-[#38A8AB] overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/default-avatar.svg"
                  alt={artist}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-[16px] font-semibold text-[#11161C]">
                {artist}
              </p>
            </div>

            <section className="card-neumorph p-5 mb-6 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#334E57]/60 mb-3">
                {isOwned ? "Your collection" : "Purchase"}
              </h3>

              {artwork.galleryName && (
                <p className="text-[14px] text-[#616161] mb-1">
                  Gallery:{" "}
                  <span className="font-semibold text-[#1A3F6C]">
                    {artwork.galleryName}
                  </span>
                </p>
              )}

              {artwork.collection && (
                <p className="text-[14px] text-[#616161] mb-4">
                  Collection:{" "}
                  <span className="font-semibold text-[#1A3F6C]">
                    {artwork.collection.name}
                  </span>
                </p>
              )}

              {isOwned && ownedAsset ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] text-[#464646]">
                      You already own this artwork.
                    </p>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-[#1A3F6C]/10 text-[#1A3F6C] px-2 py-0.5">
                      {ownedStatusLabel(ownedAsset.mintStatus)}
                    </span>
                  </div>
                  <OwnedArtworkDates
                    purchasedAt={ownedAsset.purchasedAt ?? ownedAsset.acquiredAt}
                    mintStatus={ownedAsset.mintStatus}
                    claimedAt={ownedAsset.claimedAt}
                    className="rounded-lg border border-[#BAC4C8]/40 bg-[#F8FAFB] px-3 py-2.5"
                  />
                  <RegisterOwnershipButton
                    saleId={ownedAsset.saleId}
                    title={ownedAsset.title}
                    mintStatus={ownedAsset.mintStatus}
                    onSuccess={() => {
                      fetchOwnedAssetForArtwork(id).then(setOwnedAsset).catch(() => {});
                    }}
                  />
                  <Link
                    href="/gallery"
                    className="inline-block text-[13px] font-semibold text-[#1A3F6C] hover:underline"
                  >
                    View in your gallery
                  </Link>
                </div>
              ) : showBuy ? (
                <ArtworkPriceBuy
                  artworkId={artwork.id}
                  artworkTitle={artwork.title}
                  listPriceCents={artwork.listPriceCents}
                />
              ) : (
                <p className="text-[14px] text-[#464646]">Checking your collection…</p>
              )}
            </section>

            <div className="bg-[#F8FAFB] border border-[#BAC4C8] p-5 mb-6 flex items-center justify-between">
              <div className="flex flex-col items-start gap-1 flex-1">
                <span className="text-[14px] text-[#464646]">Price</span>
                <span className="text-[20px] font-medium text-[#1A3F6C] mt-1">
                  {priceLabel}
                </span>
              </div>
              <div className="h-12 w-px bg-[#BAC4C8] opacity-60" />
              <div className="flex flex-col items-start gap-1 flex-1 pl-4">
                <span className="text-[14px] text-[#464646] leading-tight">
                  Royalty
                </span>
                <span className="text-[20px] font-medium text-[#1A3F6C]">
                  {royaltyPercent || "—"}
                </span>
              </div>
            </div>

            <h3 className="text-[17px] font-medium text-[#1A3F6C] mb-3">
              Description
            </h3>
            <p className="text-[15px] leading-[1.6] text-[#464646] mb-8">
              {description}
            </p>
          </>
        )}
      </div>

      {artwork && showBuy && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
          <div className="w-[85%] max-w-md pointer-events-auto card-neumorph px-4 py-3 bg-white/95 backdrop-blur-sm">
            <ArtworkPriceBuy
              artworkId={artwork.id}
              artworkTitle={artwork.title}
              listPriceCents={artwork.listPriceCents}
              galleryName={artwork.galleryName}
            />
          </div>
        </div>
      )}

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
