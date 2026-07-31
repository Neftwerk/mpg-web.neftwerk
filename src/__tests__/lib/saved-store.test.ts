import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocalSavedEntries,
  getLocalSavedIds,
  isLocallySaved,
  saveLocally,
  unsaveLocally,
  toggleLocalSave,
  setLocalSavedIds,
  removeLocalSavedIds,
  SAVED_CHANGE_EVENT,
} from "@/lib/saved-store";

describe("saved-store", () => {
  describe("initial state", () => {
    it("returns empty array when nothing is saved", () => {
      expect(getLocalSavedEntries()).toEqual([]);
    });

    it("returns empty ids when nothing is saved", () => {
      expect(getLocalSavedIds()).toEqual([]);
    });

    it("isLocallySaved returns false for unknown artwork", () => {
      expect(isLocallySaved("nonexistent")).toBe(false);
    });
  });

  describe("saveLocally", () => {
    it("saves an artwork and returns true", () => {
      const result = saveLocally("art1");
      expect(result).toBe(true);
      expect(isLocallySaved("art1")).toBe(true);
    });

    it("appears in saved entries with an id and savedAt", () => {
      saveLocally("art1");
      const entries = getLocalSavedEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe("art1");
      expect(entries[0].savedAt).toBeTruthy();
    });

    it("prepends new saves (newest first)", () => {
      saveLocally("art1");
      saveLocally("art2");
      const ids = getLocalSavedIds();
      expect(ids).toEqual(["art2", "art1"]);
    });

    it("does not duplicate when saving the same artwork twice", () => {
      saveLocally("art1");
      saveLocally("art1");
      expect(getLocalSavedEntries()).toHaveLength(1);
    });

    it("dispatches saved-change event", () => {
      const spy = window.dispatchEvent as ReturnType<typeof vi.fn>;
      spy.mockClear();
      saveLocally("art1");
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ type: SAVED_CHANGE_EVENT })
      );
    });
  });

  describe("unsaveLocally", () => {
    it("removes a saved artwork and returns false", () => {
      saveLocally("art1");
      const result = unsaveLocally("art1");
      expect(result).toBe(false);
      expect(isLocallySaved("art1")).toBe(false);
    });

    it("handles unsaving a non-existent artwork gracefully", () => {
      expect(() => unsaveLocally("nonexistent")).not.toThrow();
    });
  });

  describe("toggleLocalSave", () => {
    it("saves when not saved and returns true", () => {
      expect(toggleLocalSave("art1")).toBe(true);
      expect(isLocallySaved("art1")).toBe(true);
    });

    it("unsaves when already saved and returns false", () => {
      saveLocally("art1");
      expect(toggleLocalSave("art1")).toBe(false);
      expect(isLocallySaved("art1")).toBe(false);
    });
  });

  describe("setLocalSavedIds", () => {
    it("replaces saved list with new ids", () => {
      saveLocally("old1");
      setLocalSavedIds(["new1", "new2"]);
      expect(getLocalSavedIds()).toEqual(["new1", "new2"]);
    });

    it("preserves savedAt for existing entries", () => {
      saveLocally("art1");
      const originalDate = getLocalSavedEntries()[0].savedAt;
      setLocalSavedIds(["art1", "art2"]);
      const entries = getLocalSavedEntries();
      const art1Entry = entries.find((e) => e.id === "art1");
      expect(art1Entry?.savedAt).toBe(originalDate);
    });
  });

  describe("removeLocalSavedIds", () => {
    it("removes specified ids from saved list", () => {
      saveLocally("art1");
      saveLocally("art2");
      saveLocally("art3");
      removeLocalSavedIds(["art1", "art3"]);
      expect(getLocalSavedIds()).toEqual(["art2"]);
    });

    it("handles empty array gracefully", () => {
      saveLocally("art1");
      removeLocalSavedIds([]);
      expect(getLocalSavedIds()).toEqual(["art1"]);
    });
  });

  describe("localStorage resilience", () => {
    it("handles corrupted localStorage data gracefully", () => {
      localStorage.setItem("neft_saved_artworks_v1", "not valid json{{{");
      expect(getLocalSavedEntries()).toEqual([]);
    });

    it("handles non-array localStorage data gracefully", () => {
      localStorage.setItem("neft_saved_artworks_v1", '"a string"');
      expect(getLocalSavedEntries()).toEqual([]);
    });

    it("filters out malformed entries", () => {
      localStorage.setItem(
        "neft_saved_artworks_v1",
        JSON.stringify([
          { id: "valid", savedAt: "2026-01-01T00:00:00.000Z" },
          { id: 123, savedAt: "2026-01-01" },       // id is number
          null,
          { savedAt: "2026-01-01" },                 // missing id
          { id: "also-valid", savedAt: "2026-06-01T00:00:00.000Z" },
        ])
      );
      const entries = getLocalSavedEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe("valid");
      expect(entries[1].id).toBe("also-valid");
    });
  });
});
