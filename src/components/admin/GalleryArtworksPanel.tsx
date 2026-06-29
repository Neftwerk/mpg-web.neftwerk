"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAllAdminGalleryArtworks,
  type AdminArtworkRecord,
} from "@/lib/gallery-service";
import { StatusBadge } from "@/components/admin/StatusBadge";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

interface GalleryArtworksPanelProps {
  galleryId: string;
}

export function GalleryArtworksPanel({ galleryId }: GalleryArtworksPanelProps) {
  const [artworks, setArtworks] = useState<AdminArtworkRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArtworks = useCallback(async () => {
    if (!OBJECT_ID_RE.test(galleryId)) {
      setArtworks([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await fetchAllAdminGalleryArtworks(galleryId);

    if (res.ok) {
      setArtworks(res.data.artworks);
      setTotal(res.data.total);
      setError("");
    } else {
      setArtworks([]);
      setTotal(0);
      setError(res.message || "Failed to load artworks.");
    }

    setLoading(false);
  }, [galleryId]);

  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  if (!OBJECT_ID_RE.test(galleryId)) {
    return null;
  }

  return (
    <div className="card-neumorph p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-[#11181c] uppercase tracking-wider">
            Catalog Artworks
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            {loading
              ? "Loading catalog..."
              : `${total} artwork${total === 1 ? "" : "s"} in this gallery`}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && artworks.length === 0 && (
        <p className="text-sm font-bold uppercase tracking-wider text-[#1A3F6C]/60">
          No artworks uploaded yet.
        </p>
      )}

      {!loading && artworks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A3F6C]/15">
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/70">
                  Title
                </th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/70">
                  Status
                </th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/70">
                  Price
                </th>
                <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest text-[#1A3F6C]/70">
                  ID
                </th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((artwork) => (
                <tr key={artwork._id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 text-sm font-extrabold text-[#11181c]">
                    {artwork.title}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={artwork.status} variant="artwork" />
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#1A3F6C]">
                    {artwork.listPriceCents != null
                      ? `${(artwork.listPriceCents / 100).toFixed(2)} USD`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono font-bold text-[#1A3F6C]">
                      {artwork._id}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
