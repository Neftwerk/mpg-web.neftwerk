"use client";

import { useCallback, useEffect, useState } from "react";
import type { EnquiryListItem } from "@/lib/enquiry-types";
import {
  getArtworkMediaUrl,
  getArtworkRefId,
  getArtworkTitle,
} from "@/lib/enquiry-service";
import { fetchPublicArtwork } from "@/lib/gallery-service";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export interface ResolvedEnquiryArtwork {
  id: string | null;
  title: string;
  mediaUrl: string | null;
  loading: boolean;
  refreshMedia: () => Promise<void>;
}

function readArtworkFields(
  artworkId: EnquiryListItem["artworkId"] | null | undefined,
) {
  if (!artworkId) {
    return { id: null, title: "Artwork", mediaUrl: null };
  }

  return {
    id: getArtworkRefId(artworkId),
    title: getArtworkTitle(artworkId),
    mediaUrl: getArtworkMediaUrl(artworkId) ?? null,
  };
}

function needsPublicArtworkFetch(
  artworkId: EnquiryListItem["artworkId"] | null | undefined,
): boolean {
  if (!artworkId) return false;

  const { id, mediaUrl } = readArtworkFields(artworkId);
  if (!id || !OBJECT_ID_RE.test(id)) return false;
  return !mediaUrl;
}

export function useEnquiryArtwork(
  artworkId: EnquiryListItem["artworkId"] | null | undefined,
): ResolvedEnquiryArtwork {
  const [resolved, setResolved] = useState<Omit<ResolvedEnquiryArtwork, "refreshMedia">>(() => ({
    ...readArtworkFields(artworkId),
    loading: needsPublicArtworkFetch(artworkId),
  }));

  useEffect(() => {
    const { id, title, mediaUrl } = readArtworkFields(artworkId);

    if (!artworkId) {
      setResolved({ id: null, title: "Artwork", mediaUrl: null, loading: false });
      return;
    }

    setResolved({ id, title, mediaUrl, loading: false });

    if (!needsPublicArtworkFetch(artworkId)) {
      return;
    }

    let cancelled = false;
    setResolved((current) => ({ ...current, loading: true }));

    fetchPublicArtwork(id!)
      .then((artwork) => {
        if (cancelled) return;
        if (!artwork) {
          setResolved({ id, title: "Artwork", mediaUrl: null, loading: false });
          return;
        }
        setResolved({
          id: artwork.id,
          title: artwork.title,
          mediaUrl: artwork.mediaUrl ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setResolved({ id, title: "Artwork", mediaUrl: null, loading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [artworkId]);

  const refreshMedia = useCallback(async () => {
    const id = getArtworkRefId(artworkId ?? "");
    if (!id) return;

    const artwork = await fetchPublicArtwork(id);
    if (!artwork) return;

    setResolved({
      id: artwork.id,
      title: artwork.title,
      mediaUrl: artwork.mediaUrl ?? null,
      loading: false,
    });
  }, [artworkId]);

  return { ...resolved, refreshMedia };
}
