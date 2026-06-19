"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchPublicGalleries, GalleryListItem } from "@/lib/gallery-service";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { SkeletonBar } from "@/components/Skeletons";
import { formatListPrice } from "@/lib/format";
import { NeftwerkImage } from "@/components/NeftwerkImage";

function GalleryListSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="card-neumorph px-4 py-4 flex items-center gap-4">
          <SkeletonBar className="h-16 w-16 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-4 w-2/3" />
            <SkeletonBar className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleries, setGalleries] = useState<GalleryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchPublicGalleries();
        setGalleries(items);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    galleries.slice(0, 6).forEach((gallery) => {
      if (!gallery.coverMediaUrl) return;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "image";
      link.href = gallery.coverMediaUrl;
      document.head.appendChild(link);
    });
  }, [galleries]);

  return (
    <>
      <MobileTopBar title="Gallery" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Gallery</h1>
      </header>

      <div className="p-4 pb-36 mt-20 lg:mt-0 lg:pb-4">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading && <GalleryListSkeleton />}

        {!loading && galleries.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              No galleries available yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Check back soon — new galleries are being curated.
            </p>
          </div>
        )}

        {!loading && galleries.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {galleries.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/gallery/${gallery.id}`}
                className="card-neumorph px-4 py-4 flex items-center gap-4 hover:opacity-95 transition-opacity"
              >
                {gallery.coverMediaUrl ? (
                  <NeftwerkImage
                    src={gallery.coverMediaUrl}
                    alt={gallery.name}
                    className="h-16 w-16 flex-shrink-0"
                    imgClassName="h-16 w-16"
                    priority={false}
                  />
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 bg-[#e8edf0]" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-[#1A3F6C] truncate">
                    {gallery.name}
                  </p>
                  <p className="text-[12px] text-[#616161]">
                    {gallery.artworkCount} artwork{gallery.artworkCount === 1 ? "" : "s"}
                    {gallery.country ? ` · ${gallery.country}` : ""}
                  </p>
                </div>

                <p className="text-[15px] font-bold text-[#1A3F6C] whitespace-nowrap">
                  from {formatListPrice(gallery.minPriceCents)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
