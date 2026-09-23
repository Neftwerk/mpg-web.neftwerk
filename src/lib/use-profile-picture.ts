"use client";

import { useEffect, useState } from "react";
import { isPresignedMediaUrl, resolveProfilePictureUrl } from "@/lib/storage-service";

/**
 * A profile picture reference turned into something `<img src>` can use.
 *
 * A presigned URL is usable as-is; anything else is a storage key that has to be
 * exchanged for one. Returns null until that lands, so callers render their own
 * fallback in the meantime.
 *
 * The resolved URL is stored against the key it came from, so a changed input
 * never shows the previous person's picture while the new one is in flight.
 */
export function useResolvedProfilePicture(profilePicture?: string): string | null {
  const direct =
    profilePicture && isPresignedMediaUrl(profilePicture) ? profilePicture : null;
  const [resolved, setResolved] = useState<{ key: string; url: string } | null>(null);

  useEffect(() => {
    if (!profilePicture || isPresignedMediaUrl(profilePicture)) return;
    let cancelled = false;
    void resolveProfilePictureUrl(profilePicture).then((url) => {
      if (!cancelled && url) setResolved({ key: profilePicture, url });
    });
    return () => {
      cancelled = true;
    };
  }, [profilePicture]);

  if (direct) return direct;
  return resolved && resolved.key === profilePicture ? resolved.url : null;
}
