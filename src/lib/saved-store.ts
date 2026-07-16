/**
 * Device-local Saved artworks — works without an account.
 * Survives page reloads; migrates into the account via /api/saved/merge on login.
 */

export interface LocalSavedEntry {
  id: string;
  savedAt: string;
}

const STORAGE_KEY = "neft_saved_artworks_v1";
export const SAVED_CHANGE_EVENT = "neft-saved-change";

function emitSavedChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SAVED_CHANGE_EVENT));
}

function readEntries(): LocalSavedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is LocalSavedEntry =>
          Boolean(entry) &&
          typeof entry === "object" &&
          typeof (entry as LocalSavedEntry).id === "string" &&
          typeof (entry as LocalSavedEntry).savedAt === "string",
      )
      .map((entry) => ({ id: entry.id, savedAt: entry.savedAt }));
  } catch {
    return [];
  }
}

function writeEntries(entries: LocalSavedEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  emitSavedChange();
}

export function getLocalSavedEntries(): LocalSavedEntry[] {
  return readEntries();
}

export function getLocalSavedIds(): string[] {
  return readEntries().map((entry) => entry.id);
}

export function isLocallySaved(artworkId: string): boolean {
  return readEntries().some((entry) => entry.id === artworkId);
}

/** Newest-first. Returns whether the artwork is now saved. */
export function saveLocally(artworkId: string): boolean {
  const now = new Date().toISOString();
  const without = readEntries().filter((entry) => entry.id !== artworkId);
  writeEntries([{ id: artworkId, savedAt: now }, ...without]);
  return true;
}

export function unsaveLocally(artworkId: string): boolean {
  writeEntries(readEntries().filter((entry) => entry.id !== artworkId));
  return false;
}

export function toggleLocalSave(artworkId: string): boolean {
  if (isLocallySaved(artworkId)) {
    return unsaveLocally(artworkId);
  }
  return saveLocally(artworkId);
}

/** Replace local list after merge (preserves savedAt when possible). */
export function setLocalSavedIds(artworkIds: string[]) {
  const existing = new Map(readEntries().map((e) => [e.id, e.savedAt]));
  const now = new Date().toISOString();
  writeEntries(
    artworkIds.map((id) => ({
      id,
      savedAt: existing.get(id) ?? now,
    })),
  );
}

export function removeLocalSavedIds(artworkIds: string[]) {
  if (!artworkIds.length) return;
  const drop = new Set(artworkIds);
  writeEntries(readEntries().filter((entry) => !drop.has(entry.id)));
}

export function subscribeSavedChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };

  window.addEventListener(SAVED_CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SAVED_CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
