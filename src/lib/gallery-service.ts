/**
 * Gallery Service — fetches public gallery data from the Neftwerk backend.
 */

import { API_ENDPOINTS } from "./api";

const ARTWORKS_CACHE_KEY = "neft_public_artworks_v1";
const ARTWORK_CACHE_MS = 60_000;

// ─── Types ───

export interface GallerySummary {
  id: string;
  name: string;
  country: string;
}

export interface GalleryListItem {
  id: string;
  name: string;
  country?: string;
  artworkCount: number;
  minPriceCents: number;
  coverMediaUrl?: string;
}

export interface CollectionSummary {
  id: string;
  galleryId: string;
  name: string;
  description?: string;
  theme?: string;
}

export interface ArtworkItem {
  id: string;
  galleryId: string;
  collectionId: string;
  artistId: string;
  title: string;
  description?: string;
  listPriceCents: number;
  royaltyBps: number;
  mediaUrl: string;
  mediaExpiresAt?: string;
  galleryName?: string;
  collectionName?: string;
}

export interface ArtworkDetail extends ArtworkItem {
  artist?: {
    id: string;
    fullName: string;
  };
  collection?: {
    id: string;
    name: string;
  };
}

interface CachedArtworksPayload {
  items: ArtworkItem[];
  expiresAt: string;
}

// In-memory cache for the current tab session (avoids duplicate in-flight requests)
let inMemoryArtworks: ArtworkItem[] | null = null;
let inMemoryExpiresAt = 0;
let inFlightArtworks: Promise<ArtworkItem[]> | null = null;

// ─── API Helpers ───

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json as T;
  } catch {
    return null;
  }
}

function earliestMediaExpiry(items: ArtworkItem[]): string | null {
  const times = items
    .map((item) => item.mediaExpiresAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((time) => !Number.isNaN(time));

  if (!times.length) return null;
  return new Date(Math.min(...times)).toISOString();
}

function readSessionArtworksCache(): ArtworkItem[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(ARTWORKS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedArtworksPayload;
    if (new Date(parsed.expiresAt).getTime() <= Date.now() + ARTWORK_CACHE_MS) {
      sessionStorage.removeItem(ARTWORKS_CACHE_KEY);
      return null;
    }

    return parsed.items;
  } catch {
    return null;
  }
}

function writeSessionArtworksCache(items: ArtworkItem[]): void {
  if (typeof window === "undefined" || !items.length) return;

  const expiresAt = earliestMediaExpiry(items);
  if (!expiresAt) return;

  const payload: CachedArtworksPayload = { items, expiresAt };
  sessionStorage.setItem(ARTWORKS_CACHE_KEY, JSON.stringify(payload));
}

async function loadPublicArtworksFromApi(): Promise<ArtworkItem[]> {
  const json = await safeFetch<{ data?: { artworks?: ArtworkItem[] } }>(
    `${API_ENDPOINTS.PUBLIC.ARTWORKS}?limit=100`,
  );
  return json?.data?.artworks ?? [];
}

// ─── Public Functions ───

/** Fetch a single gallery summary. */
export async function fetchPublicGallery(
  galleryId: string,
): Promise<GallerySummary | null> {
  const json = await safeFetch<{ data?: { gallery?: GallerySummary } }>(
    API_ENDPOINTS.PUBLIC.GALLERY(galleryId),
  );
  return json?.data?.gallery ?? null;
}

/** Fetch collections for a gallery. */
export async function fetchPublicCollections(
  galleryId: string,
): Promise<CollectionSummary[]> {
  const json = await safeFetch<{ data?: { collections?: CollectionSummary[] } }>(
    API_ENDPOINTS.PUBLIC.GALLERY_COLLECTIONS(galleryId),
  );
  return json?.data?.collections ?? [];
}

/** Fetch artworks in a collection. */
export async function fetchPublicCollectionArtworks(
  collectionId: string,
): Promise<ArtworkItem[]> {
  const json = await safeFetch<{ data?: { artworks?: ArtworkItem[] } }>(
    API_ENDPOINTS.PUBLIC.COLLECTION_ARTWORKS(collectionId),
  );
  return json?.data?.artworks ?? [];
}

/** Fetch a single artwork by ID. */
export async function fetchPublicArtwork(
  artworkId: string,
): Promise<ArtworkDetail | null> {
  const json = await safeFetch<{ data?: { artwork?: ArtworkDetail } | ArtworkDetail }>(
    API_ENDPOINTS.PUBLIC.ARTWORK(artworkId),
  );
  if (!json?.data) return null;
  if ("artwork" in json.data && json.data.artwork) return json.data.artwork;
  if ("id" in json.data) return json.data as ArtworkDetail;
  return null;
}

/**
 * Fetch all public artworks in a single API call.
 * Cached in memory and sessionStorage until media URLs expire.
 */
export async function fetchAllPublicArtworks(): Promise<ArtworkItem[]> {
  if (inMemoryArtworks && inMemoryExpiresAt > Date.now() + ARTWORK_CACHE_MS) {
    return inMemoryArtworks;
  }

  const sessionCached = readSessionArtworksCache();
  if (sessionCached) {
    inMemoryArtworks = sessionCached;
    inMemoryExpiresAt = new Date(
      earliestMediaExpiry(sessionCached) ?? Date.now() + 3_600_000,
    ).getTime();
    return sessionCached;
  }

  if (!inFlightArtworks) {
    inFlightArtworks = loadPublicArtworksFromApi().finally(() => {
      inFlightArtworks = null;
    });
  }

  const items = await inFlightArtworks;
  inMemoryArtworks = items;
  inMemoryExpiresAt = new Date(
    earliestMediaExpiry(items) ?? Date.now() + 3_600_000,
  ).getTime();
  writeSessionArtworksCache(items);

  return items;
}

function buildGalleryListFromArtworks(artworks: ArtworkItem[]): GalleryListItem[] {
  const galleries = artworks.reduce<Record<string, GalleryListItem>>((acc, item) => {
    const existing = acc[item.galleryId];

    if (!existing) {
      acc[item.galleryId] = {
        id: item.galleryId,
        name: item.galleryName ?? "Gallery",
        artworkCount: 1,
        minPriceCents:
          item.listPriceCents > 0 ? item.listPriceCents : Number.POSITIVE_INFINITY,
        coverMediaUrl: item.mediaUrl,
      };
      return acc;
    }

    existing.artworkCount += 1;
    if (item.listPriceCents > 0) {
      existing.minPriceCents = Math.min(existing.minPriceCents, item.listPriceCents);
    }
    if (!existing.name && item.galleryName) {
      existing.name = item.galleryName;
    }
    return acc;
  }, {});

  return Object.values(galleries).map((gallery) => ({
    ...gallery,
    minPriceCents: Number.isFinite(gallery.minPriceCents) ? gallery.minPriceCents : 0,
  }));
}

/** List public galleries derived from catalog artworks. */
export async function fetchPublicGalleries(): Promise<GalleryListItem[]> {
  const artworks = await fetchAllPublicArtworks();
  const galleries = buildGalleryListFromArtworks(artworks);

  await Promise.all(
    galleries
      .filter((gallery) => gallery.name === "Gallery")
      .map(async (gallery) => {
        const details = await fetchPublicGallery(gallery.id);
        if (!details) return;

        gallery.name = details.name;
        gallery.country = details.country;
      }),
  );

  return galleries.sort((a, b) => a.name.localeCompare(b.name));
}

/** Fetch all artworks for a single gallery. */
export async function fetchPublicGalleryArtworks(
  galleryId: string,
): Promise<ArtworkItem[]> {
  const allArtworks = await fetchAllPublicArtworks();
  const fromAggregate = allArtworks.filter((item) => item.galleryId === galleryId);

  if (fromAggregate.length > 0) {
    return fromAggregate;
  }

  const gallery = await fetchPublicGallery(galleryId);
  if (!gallery) return [];

  const collections = await fetchPublicCollections(galleryId);
  if (!collections.length) return [];

  const batches = await Promise.all(
    collections.map(async (collection) => {
      const artworks = await fetchPublicCollectionArtworks(collection.id);
      return artworks.map((artwork) => ({
        ...artwork,
        galleryName: gallery.name,
        collectionName: collection.name,
      }));
    }),
  );

  return batches.flat().filter((item) => Boolean(item.mediaUrl));
}

/**
 * Fetch all collections across ACTIVE galleries.
 */
export async function fetchAllPublicCollections(): Promise<
  (CollectionSummary & { galleryName: string })[]
> {
  const artworks = await fetchAllPublicArtworks();
  const galleryIds = [...new Set(artworks.map((item) => item.galleryId))];

  const allCollections: (CollectionSummary & { galleryName: string })[] = [];

  await Promise.all(
    galleryIds.map(async (galleryId) => {
      const gallery = await fetchPublicGallery(galleryId);
      if (!gallery) return;

      const collections = await fetchPublicCollections(galleryId);
      collections.forEach((col) =>
        allCollections.push({ ...col, galleryName: gallery.name }),
      );
    }),
  );

  return allCollections;
}
