"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import {
  isArtworkSaved,
  subscribeToSaved,
  toggleSaveArtwork,
} from "@/lib/saved-service";

interface SaveArtworkButtonProps {
  artworkId: string;
  /** Hide for works already in My Gallery */
  hidden?: boolean;
  className?: string;
}

export function SaveArtworkButton({
  artworkId,
  hidden = false,
  className = "",
}: SaveArtworkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isArtworkSaved(artworkId));
    sync();
    return subscribeToSaved(sync);
  }, [artworkId]);

  if (hidden) return null;

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await toggleSaveArtwork(artworkId);
      setSaved(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? "Remove from Saved" : "Save"}
      aria-pressed={saved}
      title={saved ? "Saved" : "Save"}
      className={`inline-flex items-center justify-center p-1 transition disabled:opacity-50 ${
        saved ? "text-[#1A3F6C]" : "text-[#616161] hover:text-[#1A3F6C]"
      } ${className}`}
    >
      <Bookmark
        className="h-[22px] w-[22px]"
        strokeWidth={1.75}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
