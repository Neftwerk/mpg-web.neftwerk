"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { EnquiryListItem } from "@/lib/enquiry-types";
import { useEnquiryArtwork } from "@/lib/use-enquiry-artwork";

const SIZE_CLASS = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-16 h-16",
} as const;

interface EnquiryArtworkThumbProps {
  artworkId: EnquiryListItem["artworkId"];
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  priority?: boolean;
  linkToArtwork?: boolean;
}

function Placeholder({ size }: { size: keyof typeof SIZE_CLASS }) {
  return (
    <div
      className={`${SIZE_CLASS[size]} rounded-lg shrink-0 bg-slate-100 grid place-items-center`}
      aria-hidden
    >
      <svg
        width={size === "sm" ? 16 : 20}
        height={size === "sm" ? 16 : 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}

export function EnquiryArtworkThumb({
  artworkId,
  size = "md",
  className = "",
  priority = false,
  linkToArtwork = false,
}: EnquiryArtworkThumbProps) {
  const { id, title, mediaUrl, loading, refreshMedia } = useEnquiryArtwork(artworkId);
  const [imageFailed, setImageFailed] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const showImage = Boolean(mediaUrl) && !imageFailed;

  const image = showImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaUrl!}
      alt={title}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`${SIZE_CLASS[size]} rounded-lg object-cover shrink-0 bg-slate-100 ${className}`}
      onError={() => {
        setImageFailed(true);
        void refreshMedia().then(() => {
          if (mountedRef.current) {
            setImageFailed(false);
          }
        });
      }}
    />
  ) : loading ? (
    <div
      className={`${SIZE_CLASS[size]} rounded-lg shrink-0 bg-slate-100 animate-pulse ${className}`}
      aria-hidden
    />
  ) : (
    <Placeholder size={size} />
  );

  if (linkToArtwork && id) {
    return (
      <Link href={`/artwork/${id}`} className="shrink-0">
        {image}
      </Link>
    );
  }

  return image;
}
