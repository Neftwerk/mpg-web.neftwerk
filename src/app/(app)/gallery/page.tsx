"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { GalleryGridSkeleton } from "@/components/Skeletons";
import { useUser } from "@/lib/UserContext";
import { fetchOwnedAssets, type OwnedAsset } from "@/lib/wallet-service";
import { OwnedAssetCard } from "@/components/wallet/OwnedAssetCard";

export default function GalleryPage() {
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
        setError(err instanceof Error ? err.message : "Could not load your gallery.");
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
          setError(err instanceof Error ? err.message : "Could not load your gallery.");
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
      <MobileTopBar title="My Gallery" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Gallery</h1>
          <p className="text-sm text-slate-500 mt-1">Artworks you have purchased</p>
        </div>
      </header>

      <div className="p-4 pb-36 mt-20 lg:mt-0 lg:pb-4">
        <p className="lg:hidden text-sm text-[#616161] mb-4">
          Artworks you have purchased
        </p>

        {!userLoading && !user && (
          <div className="card-neumorph p-6 text-center space-y-4">
            <p className="text-sm text-[#464646]">
              Sign in to see artworks you have purchased.
            </p>
            <Link
              href="/login?redirect=/gallery"
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
              You have not purchased any artworks yet.
            </p>
            <Link href="/discover" className="btn-neumorph inline-block !px-8">
              Discover artworks
            </Link>
          </div>
        )}

        {user && !loading && assets.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <OwnedAssetCard
                key={asset.saleId}
                asset={asset}
                onMintSuccess={reloadAssets}
                showMintActions={false}
              />
            ))}
          </div>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
