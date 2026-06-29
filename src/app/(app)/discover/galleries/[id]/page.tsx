"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import {
  fetchPublicGallery,
  fetchPublicGalleryArtworks,
  ArtworkItem,
} from "@/lib/gallery-service";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { GalleryGridSkeleton } from "@/components/Skeletons";
import { GalleryArtworkCard } from "@/components/artwork/GalleryArtworkCard";

type Params = { id: string };

export default function DiscoverGalleryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = use(params);
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryName, setGalleryName] = useState<string>("Gallery");
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [gallery, items] = await Promise.all([
          fetchPublicGallery(id),
          fetchPublicGalleryArtworks(id),
        ]);

        if (!gallery && items.length === 0) {
          setError("Gallery not found.");
          return;
        }

        setGalleryName(gallery?.name ?? items[0]?.galleryName ?? "Gallery");
        setArtworks(items);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const leftItems = artworks.filter((_, index) => index % 2 === 0);
  const rightItems = artworks.filter((_, index) => index % 2 === 1);

  return (
    <>
      <MobileTopBar title={galleryName} onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/discover#galleries"
            className="text-sm font-medium text-[#4D91A7] hover:underline"
          >
            Galleries
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-semibold text-slate-900">{galleryName}</h1>
        </div>
      </header>

      <div className="p-4 pb-36 mt-20 lg:mt-0 lg:pb-4">
        <Link
          href="/discover#galleries"
          className="lg:hidden inline-flex items-center text-sm font-medium text-[#4D91A7] mb-4"
        >
          ← All galleries
        </Link>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading && <GalleryGridSkeleton count={6} />}

        {!loading && !error && artworks.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              No artworks in this gallery yet.
            </p>
          </div>
        )}

        {!loading && artworks.length > 0 && (
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="flex flex-col gap-3">
              {leftItems.map((item, index) => (
                <GalleryArtworkCard
                  key={item.id}
                  item={item}
                  priority={index === 0}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {rightItems.map((item) => (
                <GalleryArtworkCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
