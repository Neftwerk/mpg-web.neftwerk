"use client";

import { useState, useEffect, use } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchPublicGallery,
  fetchPublicGalleryArtworks,
  ArtworkItem,
} from "@/lib/gallery-service";
import { MobileMenu } from "@/components/sidebar/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { GalleryGridSkeleton } from "@/components/Skeletons";
import { GalleryArtworkCard } from "@/components/artwork/GalleryArtworkCard";
import { ArtworkMasonry } from "@/components/artwork/ArtworkMasonry";

type Params = { id: string };

export default function DiscoverGalleryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryName, setGalleryName] = useState<string>("Gallery");
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [gallery, items] = await Promise.all([
          fetchPublicGallery(id),
          fetchPublicGalleryArtworks(id),
        ]);

        if (!gallery && items.length === 0) {
          setError(t("discover.galleryNotFound"));
          return;
        }

        setGalleryName(gallery?.name ?? items[0]?.galleryName ?? t("discover.galleriesTitle"));
        setArtworks(items);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  return (
    <>
      <PageHeader
        title={galleryName}
        backHref="/discover#galleries"
        backLabel={t("discover.galleriesTitle")}
        onMenuOpen={() => setMenuOpen(true)}
      />



      <div className="p-4 pb-36 mt-20 lg:mt-0 lg:pb-4">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading && <GalleryGridSkeleton count={6} />}

        {!loading && !error && artworks.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              {t("discover.noArtworksInGalleryYet")}
            </p>
          </div>
        )}

        {!loading && artworks.length > 0 && (
          <ArtworkMasonry>
            {artworks.map((item, index) => (
              <GalleryArtworkCard
                key={item.id}
                item={item}
                priority={index === 0}
              />
            ))}
          </ArtworkMasonry>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
