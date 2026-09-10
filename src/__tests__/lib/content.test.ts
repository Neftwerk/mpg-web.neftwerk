import { describe, it, expect } from "vitest";
import {
  navItems,
  galleryItems,
  collections,
  discoverPopular,
} from "@/lib/content";

describe("content constants", () => {
  describe("navItems", () => {
    it("contains expected navigation items", () => {
      expect(navItems.length).toBeGreaterThanOrEqual(5);
    });

    it("each item has href, labelKey, and icon", () => {
      for (const item of navItems) {
        expect(item.href).toMatch(/^\//);
        expect(item.labelKey).toBeTruthy();
        expect(item.icon).toBeTruthy();
      }
    });

    it("includes forum, discover, gallery, wallet, and profile", () => {
      const icons = navItems.map((i) => i.icon);
      expect(icons).toContain("forum");
      expect(icons).toContain("discover");
      expect(icons).toContain("gallery");
      expect(icons).toContain("wallet");
      expect(icons).toContain("profile");
    });
  });

  describe("galleryItems", () => {
    it("has items with required fields", () => {
      expect(galleryItems.length).toBeGreaterThan(0);
      for (const item of galleryItems) {
        expect(item.id).toBeTruthy();
        expect(item.caption).toBeTruthy();
        expect(item.imageUrl).toBeTruthy();
        expect(item.artist).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    });

    it("has unique ids", () => {
      const ids = galleryItems.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("collections", () => {
    it("has items with id and tag", () => {
      expect(collections.length).toBeGreaterThan(0);
      for (const c of collections) {
        expect(c.id).toBeTruthy();
        expect(c.tag).toMatch(/^#/);
      }
    });
  });

  describe("discoverPopular", () => {
    it("has items with id, title, and imageUrl", () => {
      expect(discoverPopular.length).toBeGreaterThan(0);
      for (const item of discoverPopular) {
        expect(item.id).toBeTruthy();
        expect(item.title).toBeTruthy();
        expect(item.imageUrl).toBeTruthy();
      }
    });
  });

});
