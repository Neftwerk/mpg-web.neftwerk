"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  fetchAllPublicArtworks,
  fetchPublicGalleries,
  ArtworkItem,
  GalleryListItem,
} from "@/lib/gallery-service";
import {
  fetchPublicDiscoveryModules,
  type PublicDiscoveryModule,
} from "@/lib/discovery-service";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { GalleryGridSkeleton, SkeletonBar } from "@/components/Skeletons";
import { GalleryArtworkCard } from "@/components/artwork/GalleryArtworkCard";
import { ArtworkMasonry } from "@/components/artwork/ArtworkMasonry";
import { GalleriesList } from "@/components/gallery/GalleriesList";
import { NeftwerkImage } from "@/components/NeftwerkImage";

function DiscoverSectionsSkeleton() {
  return (
    <>
      <SkeletonBar className="h-4 w-24 mb-3" />
      <div className="grid gap-3 sm:grid-cols-2 mb-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="card-neumorph px-4 py-4 flex items-center gap-4">
            <SkeletonBar className="h-16 w-16 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-4 w-2/3" />
              <SkeletonBar className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 space-y-3">
        <SkeletonBar className="h-4 w-48" />
        <SkeletonBar className="h-3 w-full max-w-md" />
        <SkeletonBar className="h-3 w-32" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card-neumorph overflow-hidden">
              <SkeletonBar className="w-full min-h-[6rem] aspect-[3/4]" />
              <SkeletonBar className="h-3 w-3/4 mx-1 my-2" />
            </div>
          ))}
        </div>
      </div>

      <GalleryGridSkeleton count={6} />
    </>
  );
}

function DiscoveryModuleSection({
  module,
  priority,
}: {
  module: PublicDiscoveryModule;
  priority?: boolean;
}) {
  return (
    <section className="mb-8">
      <h3 className="text-[16px] font-bold text-[#1A3F6C] mb-2">{module.title}</h3>
      <p className="text-[14px] text-[#616161] leading-relaxed mb-2">{module.text}</p>
      {module.curatorName ? (
        <p className="text-[12px] text-[#334E57] mb-3">
          Curated by {module.curatorName}
        </p>
      ) : null}
      {module.artworks.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {module.artworks.map((item, index) => (
            <Link
              key={item.id}
              href={`/artwork/${item.id}`}
              className="card-neumorph overflow-hidden"
            >
              <NeftwerkImage
                src={item.mediaUrl}
                alt={item.title}
                fit="natural"
                width={item.mediaWidth}
                height={item.mediaHeight}
                className="w-full"
                priority={Boolean(priority) && index === 0}
              />
              <p className="px-1 py-2 text-[11px] font-medium text-[#464646] truncate">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">Works for this spotlight coming soon.</p>
      )}
    </section>
  );
}

export default function DiscoverPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [galleries, setGalleries] = useState<GalleryListItem[]>([]);
  const [modules, setModules] = useState<PublicDiscoveryModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [artworkItems, galleryItems, discoveryModules] = await Promise.all([
          fetchAllPublicArtworks(),
          fetchPublicGalleries(),
          fetchPublicDiscoveryModules().catch(() => [] as PublicDiscoveryModule[]),
        ]);
        setArtworks(artworkItems);
        setGalleries(galleryItems);
        setModules(discoveryModules);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredArtworks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return artworks;

    return artworks.filter((item) => {
      const haystack = [
        item.title,
        item.galleryName,
        item.collectionName,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [artworks, search]);

  const isSearching = search.trim().length > 0;

  return (
    <>
      <MobileTopBar title="Discover" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4 mt-20 lg:mt-0">
        <h1 className="text-xl font-semibold text-slate-900">Discover</h1>
      </header>

      <div className="p-4 pb-28 lg:pb-4 mt-20 lg:mt-0">
        <div className="relative mb-8">
          <input
            className="w-full border border-slate-200 bg-white/60 pl-4 pr-10 py-3 text-[15px] placeholder:text-[#888] outline-none transition focus:border-[#4D91A7] focus:ring-1 focus:ring-[#4D91A7]/20 shadow-sm"
            placeholder="Search artworks"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading && <DiscoverSectionsSkeleton />}

        {!loading && !isSearching && (
          <section id="galleries" className="mb-8 scroll-mt-24">
            <h3 className="text-[16px] font-bold text-[#1A3F6C] mb-3">Galleries</h3>
            <GalleriesList galleries={galleries} prefetchCovers />
          </section>
        )}

        {!loading && !isSearching && modules.length > 0 && (
          <div id="curated">
            {modules.map((module, index) => (
              <DiscoveryModuleSection
                key={module.id}
                module={module}
                priority={index === 0}
              />
            ))}
          </div>
        )}

        {!loading && !isSearching && modules.length === 0 && (
          <div className="mb-8 text-center py-8">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              Spotlights coming soon
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Check back soon — curated selections are on the way.
            </p>
          </div>
        )}

        {!loading && !isSearching && artworks.length === 0 && galleries.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              No artworks available yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Check back soon — new pieces are being curated.
            </p>
          </div>
        )}

        {!loading && isSearching && filteredArtworks.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-sm uppercase tracking-wider text-[#334E57]/60">
              No artworks match your search.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try a different title or gallery name.
            </p>
          </div>
        )}

        {!loading && filteredArtworks.length > 0 && (
          <>
            <h3 className="text-[16px] font-bold text-[#1A3F6C] mb-3">
              {isSearching ? "Search results" : "All artworks"}
            </h3>
            <ArtworkMasonry>
              {filteredArtworks.map((item, index) => (
                <GalleryArtworkCard
                  key={item.id}
                  item={item}
                  priority={!isSearching && index === 0}
                />
              ))}
            </ArtworkMasonry>
          </>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
