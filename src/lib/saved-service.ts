/**
 * Saved artworks — local-first, synced to the account when signed in.
 */

import { API_ENDPOINTS } from "./api";
import { authedFetch, getAccessToken } from "./auth-service";
import {
  fetchAllPublicArtworks,
  fetchPublicArtwork,
  type ArtworkItem,
} from "./gallery-service";
import { fetchOwnedAssets } from "./wallet-service";
import {
  getLocalSavedIds,
  isLocallySaved,
  removeLocalSavedIds,
  saveLocally,
  setLocalSavedIds,
  subscribeSavedChange,
  unsaveLocally,
} from "./saved-store";

let mergeInFlight: Promise<void> | null = null;
let lastMergedUserKey: string | null = null;

function unwrapData<T>(payload: unknown): T | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;
  if (root.data && typeof root.data === "object") {
    return root.data as T;
  }
  return payload as T;
}

export function isArtworkSaved(artworkId: string): boolean {
  return isLocallySaved(artworkId);
}

export function subscribeToSaved(listener: () => void): () => void {
  return subscribeSavedChange(listener);
}

/**
 * Toggle save on this device immediately.
 * When authenticated, mirrors to the server in the background.
 */
export async function toggleSaveArtwork(artworkId: string): Promise<boolean> {
  const next = isLocallySaved(artworkId)
    ? unsaveLocally(artworkId)
    : saveLocally(artworkId);

  const token = getAccessToken();
  if (!token) return next;

  try {
    if (next) {
      const res = await authedFetch(API_ENDPOINTS.SAVED.SAVE(artworkId), {
        method: "POST",
      });
      if (!res.ok && res.status === 400) {
        // Already owned — keep My Gallery as source of truth
        unsaveLocally(artworkId);
        return false;
      }
    } else {
      await authedFetch(API_ENDPOINTS.SAVED.UNSAVE(artworkId), {
        method: "DELETE",
      });
    }
  } catch (err) {
    console.error("[Saved] sync failed:", err);
  }

  return next;
}

/** Merge device saves into the account once per login session. */
export async function mergeSavedOnLogin(userKey: string): Promise<void> {
  if (!getAccessToken()) return;
  if (lastMergedUserKey === userKey && !mergeInFlight) return;

  if (mergeInFlight) {
    await mergeInFlight;
    return;
  }

  mergeInFlight = (async () => {
    const localIds = getLocalSavedIds();
    const res = await authedFetch<{ artworkIds?: string[] }>(
      API_ENDPOINTS.SAVED.MERGE,
      {
        method: "POST",
        body: JSON.stringify({ artworkIds: localIds }),
      },
    );

    if (!res.ok) {
      console.error("[Saved] merge failed:", res.message);
      return;
    }

    const data = unwrapData<{ artworkIds?: string[] }>(res.data);
    const mergedIds = data?.artworkIds ?? [];
    setLocalSavedIds(mergedIds);
    lastMergedUserKey = userKey;

    // Strip anything that drifted into purchases
    await stripPurchasedFromLocal();
  })().finally(() => {
    mergeInFlight = null;
  });

  await mergeInFlight;
}

export function resetSavedMergeState() {
  lastMergedUserKey = null;
}

async function stripPurchasedFromLocal(): Promise<void> {
  if (!getAccessToken()) return;
  try {
    const owned = await fetchOwnedAssets();
    const ownedIds = owned.map((a) => a.artworkId);
    if (ownedIds.length) {
      removeLocalSavedIds(ownedIds);
    }
  } catch {
    // Guest gallery list may 401 — ignore
  }
}

/**
 * Resolve Saved artworks for profile / grids.
 * Signed-in: server list (excludes purchased). Guest: local IDs via public catalog.
 */
export async function listSavedArtworksForDisplay(): Promise<ArtworkItem[]> {
  const token = getAccessToken();

  if (token) {
    const res = await authedFetch<{ artworks?: ArtworkItem[] }>(
      API_ENDPOINTS.SAVED.LIST,
    );
    if (res.ok) {
      const data = unwrapData<{ artworks?: ArtworkItem[] }>(res.data);
      const artworks = data?.artworks ?? [];
      setLocalSavedIds(artworks.map((a) => a.id));
      return artworks;
    }
  }

  const localIds = getLocalSavedIds();
  if (!localIds.length) return [];

  const catalog = await fetchAllPublicArtworks();
  const byId = new Map(catalog.map((item) => [item.id, item]));

  const missing = localIds.filter((id) => !byId.has(id));
  if (missing.length) {
    await Promise.all(
      missing.map(async (id) => {
        const detail = await fetchPublicArtwork(id);
        if (detail) byId.set(id, detail);
      }),
    );
  }

  return localIds
    .map((id) => byId.get(id))
    .filter((item): item is ArtworkItem => Boolean(item));
}
