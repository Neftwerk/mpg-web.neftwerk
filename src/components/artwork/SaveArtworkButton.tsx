"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useToast } from "@/components/Toast";
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
  const { showToast } = useToast();

  useEffect(() => {
    const sync = () => setSaved(isArtworkSaved(artworkId));
    sync();
    return subscribeToSaved(sync);
  }, [artworkId]);

  if (hidden) return null;

  const handleClick = async () => {
    if (busy) return;
    // What the tap meant, read from the service rather than local state, so the
    // confirmation describes the intent even when the result differs from it.
    const meantToSave = !isArtworkSaved(artworkId);
    setBusy(true);
    try {
      const next = await toggleSaveArtwork(artworkId);
      setSaved(next);
      if (next) {
        showToast("Saved to your collection");
      } else if (meantToSave) {
        // The server rejects a save for a work already owned and clears it
        // locally. Saying "removed" there would describe the opposite of the tap.
        showToast("This is already in your gallery");
      } else {
        showToast("Removed from saved");
      }
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
