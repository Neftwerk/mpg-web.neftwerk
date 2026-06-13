"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchAllPublicArtworks, ArtworkItem } from "@/lib/gallery-service";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { GalleryGridSkeleton } from "@/components/Skeletons";

export default function GalleryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchAllPublicArtworks();
        setArtworks(items);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* Split artworks into left/right columns for the staggered Figma layout */
  const leftItems = artworks.filter((_, i) => i % 2 === 0);
  const rightItems = artworks.filter((_, i) => i % 2 === 1);

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Gallery" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Gallery</h1>
      </header>

      {/* Gallery — 2 column staggered grid */}
      <div className="p-4 pb-36 mt-20 lg:mt-0 lg:pb-4">
        {loading && <GalleryGridSkeleton count={6} />}

        {!loading && artworks.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              No artworks available yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Check back soon — new pieces are being curated.
            </p>
          </div>
        )}

        {!loading && artworks.length > 0 && (
          <div className="grid grid-cols-2 gap-3 items-start">
            {/* Left column */}
            <div className="flex flex-col gap-3">
              {leftItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/artwork/${item.id}`}
                  className="block card-neumorph"
                >
                  <NeftwerkImage
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full object-cover"
                  />
                  <p className="px-2 py-2 text-[13px] font-medium text-[#11181c]">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3">
              {rightItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/artwork/${item.id}`}
                  className="block card-neumorph"
                >
                  <NeftwerkImage
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full object-cover"
                  />
                  <p className="px-2 py-2 text-[13px] font-medium text-[#11181c]">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky View collections button — always visible at bottom */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <Link
          href="/collections"
          className="btn-neumorph px-10 pointer-events-auto"
        >
          View collections
        </Link>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
