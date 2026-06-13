"use client";

import Link from "next/link";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { ArtworkPriceBuy } from "@/components/artwork/ArtworkPriceBuy";
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
          className="w-full object-cover"
          priority={priority}
        />
      </Link>

      <div className="px-3 py-3">
        <Link href={`/artwork/${item.id}`} className="block">
          <p className="text-[13px] font-medium text-[#11181c] line-clamp-2">
            {item.title}
          </p>
        </Link>

        <ArtworkPriceBuy
          artworkId={item.id}
          listPriceCents={item.listPriceCents}
          galleryName={item.galleryName}
          compact
        />
      </div>
    </article>
  );
}
