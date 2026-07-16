"use client";

import Link from "next/link";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import type { ArtworkItem } from "@/lib/gallery-service";

interface GalleryArtworkCardProps {
  item: ArtworkItem;
  priority?: boolean;
}

export function GalleryArtworkCard({ item, priority = false }: GalleryArtworkCardProps) {
  return (
    <article className="card-neumorph overflow-hidden">
      <Link href={`/artwork/${item.id}`} className="block">
        <NeftwerkImage
          src={item.mediaUrl}
          alt={item.title}
          fit="natural"
          width={item.mediaWidth}
          height={item.mediaHeight}
          className="w-full"
          priority={priority}
        />
        <div className="px-3 py-3">
          <p className="text-[13px] font-medium text-[#11181c] line-clamp-2">
            {item.title}
          </p>
          {item.galleryName ? (
            <p className="mt-1 text-[11px] uppercase tracking-wider text-[#334E57]/60 truncate">
              {item.galleryName}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
