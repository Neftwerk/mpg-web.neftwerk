"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getGalleryListImageUrl, type GalleryListItem } from "@/lib/gallery-service";
import { NeftwerkImage } from "@/components/NeftwerkImage";

interface GalleriesListProps {
  galleries: GalleryListItem[];
  galleryHref?: (galleryId: string) => string;
  prefetchCovers?: boolean;
}

export function GalleriesList({
  galleries,
  galleryHref = (id) => `/discover/galleries/${id}`,
  prefetchCovers = false,
}: GalleriesListProps) {
  useEffect(() => {
    if (!prefetchCovers) return;

    galleries.slice(0, 6).forEach((gallery) => {
      const imageUrl = getGalleryListImageUrl(gallery);
      if (!imageUrl) return;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "image";
      link.href = imageUrl;
      document.head.appendChild(link);
    });
  }, [galleries, prefetchCovers]);

  if (galleries.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
          No galleries available yet.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Check back soon — new galleries are being curated.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {galleries.map((gallery) => {
        const imageUrl = getGalleryListImageUrl(gallery);

        return (
        <Link
          key={gallery.id}
          href={galleryHref(gallery.id)}
          className="card-neumorph px-4 py-4 flex items-center gap-4 hover:opacity-95 transition-opacity"
        >
          {imageUrl ? (
            <NeftwerkImage
              src={imageUrl}
              alt={gallery.name}
              fit="cover"
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
        </Link>
        );
      })}
    </div>
  );
}
