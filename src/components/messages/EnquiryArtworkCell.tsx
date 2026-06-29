"use client";

import type { EnquiryListItem } from "@/lib/enquiry-types";
import { getArtworkTitle } from "@/lib/enquiry-service";
import { useEnquiryArtwork } from "@/lib/use-enquiry-artwork";
import { EnquiryArtworkThumb } from "@/components/messages/EnquiryArtworkThumb";

interface EnquiryArtworkCellProps {
  artworkId: EnquiryListItem["artworkId"];
  size?: "sm" | "md";
  showTitle?: boolean;
  linkToArtwork?: boolean;
  priority?: boolean;
  className?: string;
}

export function EnquiryArtworkCell({
  artworkId,
  size = "sm",
  showTitle = true,
  linkToArtwork = false,
  priority = false,
  className = "",
}: EnquiryArtworkCellProps) {
  const { title: resolvedTitle } = useEnquiryArtwork(artworkId);
  const fallbackTitle = getArtworkTitle(artworkId);
  const title = resolvedTitle !== "Artwork" ? resolvedTitle : fallbackTitle;

  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <EnquiryArtworkThumb
        artworkId={artworkId}
        size={size}
        linkToArtwork={linkToArtwork}
        priority={priority}
      />
      {showTitle && (
        <span className="truncate text-sm font-medium text-[#11181c]">{title}</span>
      )}
    </div>
  );
}
