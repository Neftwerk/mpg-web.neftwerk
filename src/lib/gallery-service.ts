/**
 * Gallery Service — fetches public gallery data from the Neftwerk backend.
 *
 * Flow: Gallery → Collections → Artworks
 * The public API only exposes per-gallery lookups (no "list all" endpoint).
 * We maintain a list of known ACTIVE gallery IDs and aggregate artworks across all.
 */

import { API_ENDPOINTS } from "./api";

// ─── Known ACTIVE gallery IDs ───
// These are the galleries that have been approved (status: ACTIVE) in the admin panel.
// When a new gallery is approved, add its _id here.
const ACTIVE_GALLERY_IDS = [
  "6a233f7bad3f9789b9a7e82f", // My Test Gallery
  "6a233ec5ad3f9789b9a7e826", // Flow Gallery 1780694725
];

// ─── Types ───

export interface GallerySummary {
  id: string;
  name: string;
  country: string;
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
  // Enriched fields
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

// ─── Public Functions ───

/** Fetch a single gallery summary. */
export async function fetchPublicGallery(
  galleryId: string
): Promise<GallerySummary | null> {
  const json = await safeFetch<any>(API_ENDPOINTS.PUBLIC.GALLERY(galleryId));
  return json?.data?.gallery || null;
}

/** Fetch collections for a gallery. */
export async function fetchPublicCollections(
  galleryId: string
): Promise<CollectionSummary[]> {
  const json = await safeFetch<any>(
    API_ENDPOINTS.PUBLIC.GALLERY_COLLECTIONS(galleryId)
  );
  return json?.data?.collections || [];
}

/** Fetch artworks in a collection. */
export async function fetchPublicCollectionArtworks(
  collectionId: string
): Promise<ArtworkItem[]> {
  const json = await safeFetch<any>(
    API_ENDPOINTS.PUBLIC.COLLECTION_ARTWORKS(collectionId)
  );
  return json?.data?.artworks || [];
}

/** Fetch a single artwork by ID. */
export async function fetchPublicArtwork(
  artworkId: string
): Promise<ArtworkDetail | null> {
  const json = await safeFetch<any>(API_ENDPOINTS.PUBLIC.ARTWORK(artworkId));
  return json?.data?.artwork || json?.data || null;
}

/**
 * Aggregate all artworks across all known ACTIVE galleries.
 * Chains: galleries → collections → artworks for each.
 * Returns a flat array of artworks enriched with gallery/collection names.
 */
export async function fetchAllPublicArtworks(): Promise<ArtworkItem[]> {
  const allArtworks: ArtworkItem[] = [];

  // Fetch all galleries in parallel
  const galleryPromises = ACTIVE_GALLERY_IDS.map(async (galleryId) => {
    const gallery = await fetchPublicGallery(galleryId);
    if (!gallery) return;

    const collections = await fetchPublicCollections(galleryId);
    if (!collections.length) return;

    // Fetch artworks from each collection in parallel
    const artworkBatches = await Promise.all(
      collections.map(async (col) => {
        const artworks = await fetchPublicCollectionArtworks(col.id);
        return artworks.map((aw) => ({
          ...aw,
          galleryName: gallery.name,
          collectionName: col.name,
        }));
      })
    );

    artworkBatches.forEach((batch) => allArtworks.push(...batch));
  });

  await Promise.all(galleryPromises);

  return allArtworks;
}

/**
 * Fetch all collections across all known ACTIVE galleries.
 * Returns a flat array of collections enriched with gallery names.
 */
export async function fetchAllPublicCollections(): Promise<
  (CollectionSummary & { galleryName: string })[]
> {
  const allCollections: (CollectionSummary & { galleryName: string })[] = [];

  const promises = ACTIVE_GALLERY_IDS.map(async (galleryId) => {
    const gallery = await fetchPublicGallery(galleryId);
    if (!gallery) return;

    const collections = await fetchPublicCollections(galleryId);
    collections.forEach((col) =>
      allCollections.push({ ...col, galleryName: gallery.name })
    );
  });

  await Promise.all(promises);
  return allCollections;
}
