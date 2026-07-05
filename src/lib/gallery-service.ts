/**
 * Gallery Service — public catalog and admin gallery APIs.
 */

import { API_ENDPOINTS } from "./api";
import { authedFetch, type ApiResponse } from "./auth-service";

const ARTWORKS_CACHE_KEY = "neft_public_artworks_v4";
/** Buffer before in-memory expiry — avoids serving at the last second. */
const ARTWORK_CACHE_MS = 60_000;
/** Match backend Redis catalog TTL so list prices refresh promptly. */
const CATALOG_LIST_CACHE_MS = 300_000;

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
  minPriceCents?: number | null;
  profileMediaUrl?: string;
  profileMediaExpiresAt?: string;
  coverMediaUrl?: string;
  coverMediaExpiresAt?: string;
}

export function getGalleryListImageUrl(gallery: GalleryListItem): string | undefined {
  return gallery.profileMediaUrl ?? gallery.coverMediaUrl;
}

export interface GalleryProfilePicture {
  s3Bucket: string;
  s3Key: string;
  mimeType?: string;
  originalName?: string;
  size?: number;
}

export interface AdminGalleryRecord {
  _id: string;
  name: string;
  profilePicture?: GalleryProfilePicture;
  status: string;
}

export interface AdminArtworkRecord {
  _id: string;
  galleryId: string;
  collectionId: string;
  artistId: string;
  title: string;
  description: string;
  status: string;
  listPriceCents?: number;
  royaltyBps?: number;
  createdAt?: string;
}

export interface AdminArtworkListResponse {
  artworks: AdminArtworkRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ListAdminGalleryArtworksParams {
  status?: string;
  collectionId?: string;
  artistId?: string;
  search?: string;
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
  listPriceCents?: number;
  royaltyBps?: number;
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

/** Cap catalog cache so price/title changes are not tied to 7-day media URLs. */
function catalogCacheExpiresAt(items: ArtworkItem[]): string {
  const catalogExpiry = Date.now() + CATALOG_LIST_CACHE_MS;
  const mediaExpiry = earliestMediaExpiry(items);
  if (!mediaExpiry) {
    return new Date(catalogExpiry).toISOString();
  }
  return new Date(
    Math.min(new Date(mediaExpiry).getTime(), catalogExpiry),
  ).toISOString();
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

  const payload: CachedArtworksPayload = {
    items,
    expiresAt: catalogCacheExpiresAt(items),
  };
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
 * Cached in memory and sessionStorage for up to 5 minutes (matches backend catalog TTL).
 */
export async function fetchAllPublicArtworks(): Promise<ArtworkItem[]> {
  if (inMemoryArtworks && inMemoryExpiresAt > Date.now() + ARTWORK_CACHE_MS) {
    return inMemoryArtworks;
  }

  const sessionCached = readSessionArtworksCache();
  if (sessionCached) {
    inMemoryArtworks = sessionCached;
    inMemoryExpiresAt = new Date(catalogCacheExpiresAt(sessionCached)).getTime();
    return sessionCached;
  }

  if (!inFlightArtworks) {
    inFlightArtworks = loadPublicArtworksFromApi().finally(() => {
      inFlightArtworks = null;
    });
  }

  const items = await inFlightArtworks;
  inMemoryArtworks = items;
  inMemoryExpiresAt = new Date(catalogCacheExpiresAt(items)).getTime();
  writeSessionArtworksCache(items);

  return items;
}

/** Drop cached public artwork lists (e.g. after admin sale resets). */
export function clearPublicArtworksCache(): void {
  inMemoryArtworks = null;
  inMemoryExpiresAt = 0;
  inFlightArtworks = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ARTWORKS_CACHE_KEY);
    sessionStorage.removeItem("neft_public_artworks_v1");
    sessionStorage.removeItem("neft_public_artworks_v2");
  }
}

/** List public galleries with catalog stats (fast — no full artwork fetch). */
export async function fetchPublicGalleries(): Promise<GalleryListItem[]> {
  const json = await safeFetch<{ data?: { galleries?: GalleryListItem[] } }>(
    `${API_ENDPOINTS.PUBLIC.GALLERIES}?limit=100`,
  );
  return json?.data?.galleries ?? [];
}

/** Fetch all artworks for a single gallery. */
export async function fetchPublicGalleryArtworks(
  galleryId: string,
): Promise<ArtworkItem[]> {
  const json = await safeFetch<{ data?: { artworks?: ArtworkItem[] } }>(
    `${API_ENDPOINTS.PUBLIC.GALLERY_ARTWORKS(galleryId)}?limit=100`,
  );
  return json?.data?.artworks ?? [];
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

function unwrapAuthedData<T>(data: unknown): T {
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

/** List all artworks for a gallery (admin API). */
export async function listAdminGalleryArtworks(
  galleryId: string,
  params: ListAdminGalleryArtworksParams = {},
): Promise<ApiResponse<AdminArtworkListResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.collectionId) query.set("collectionId", params.collectionId);
  if (params.artistId) query.set("artistId", params.artistId);
  if (params.search) query.set("search", params.search);

  const qs = query.toString();
  const url = `${API_ENDPOINTS.ADMIN_GALLERIES.ARTWORKS(galleryId)}${qs ? `?${qs}` : ""}`;
  const res = await authedFetch<unknown>(url, { method: "GET" });

  if (!res.ok) return res as ApiResponse<AdminArtworkListResponse>;

  return {
    ...res,
    data: unwrapAuthedData<AdminArtworkListResponse>(res.data),
  };
}

/** Fetch all artworks for a gallery (admin API). */
export async function fetchAllAdminGalleryArtworks(
  galleryId: string,
  params: ListAdminGalleryArtworksParams = {},
): Promise<ApiResponse<{ artworks: AdminArtworkRecord[]; total: number }>> {
  const res = await listAdminGalleryArtworks(galleryId, params);

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      data: { artworks: [], total: 0 },
      message: res.message,
    };
  }

  return {
    ok: true,
    status: res.status,
    data: {
      artworks: res.data.artworks,
      total: res.data.pagination.total,
    },
  };
}

/** Update an admin gallery record (e.g. profile picture). */
export async function updateAdminGallery(
  galleryId: string,
  payload: { profilePicture?: GalleryProfilePicture | null },
): Promise<ApiResponse<{ gallery: AdminGalleryRecord }>> {
  const res = await authedFetch<unknown>(
    API_ENDPOINTS.ADMIN_GALLERIES.UPDATE(galleryId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    return res as ApiResponse<{ gallery: AdminGalleryRecord }>;
  }

  return {
    ...res,
    data: unwrapAuthedData<{ gallery: AdminGalleryRecord }>(res.data),
  };
}
