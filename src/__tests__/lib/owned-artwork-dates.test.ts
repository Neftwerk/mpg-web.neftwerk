import { describe, it, expect } from "vitest";
import {
  formatOwnershipDate,
  getOwnershipDateRows,
} from "@/lib/owned-artwork-dates";

describe("formatOwnershipDate", () => {
  it("formats a date in 'Mon DD, YYYY' format", () => {
    const result = formatOwnershipDate("2026-03-20T10:30:00.000Z");
    expect(result).toMatch(/Mar\s+20,\s+2026/);
  });

  it("formats another date correctly", () => {
    const result = formatOwnershipDate("2025-12-25T00:00:00.000Z");
    expect(result).toMatch(/Dec\s+25,\s+2025/);
  });
});

describe("getOwnershipDateRows", () => {
  const purchasedAt = "2026-01-15T12:00:00.000Z";

  it("returns Purchased + Claimed rows for minted status with claimedAt", () => {
    const rows = getOwnershipDateRows(purchasedAt, "minted", "2026-02-01T12:00:00.000Z");
    expect(rows).toHaveLength(2);
    expect(rows[0].label).toBe("Purchased");
    expect(rows[1].label).toBe("Claimed");
    expect(rows[1].value).toMatch(/Feb/);
  });

  it("returns 'Ready when you are' for queued status", () => {
    const rows = getOwnershipDateRows(purchasedAt, "queued");
    expect(rows).toHaveLength(2);
    expect(rows[1].label).toBe("Claim");
    expect(rows[1].value).toBe("Ready when you are");
  });

  it("returns 'Ready when you are' for failed status", () => {
    const rows = getOwnershipDateRows(purchasedAt, "failed");
    expect(rows).toHaveLength(2);
    expect(rows[1].label).toBe("Claim");
    expect(rows[1].value).toBe("Ready when you are");
  });

  it("returns 'Ready to claim on-chain' for not_started status", () => {
    const rows = getOwnershipDateRows(purchasedAt, "not_started");
    expect(rows).toHaveLength(2);
    expect(rows[1].label).toBe("Claim");
    expect(rows[1].value).toBe("Ready to claim on-chain");
  });

  it("returns 'Ready to claim on-chain' for awaiting_collector status", () => {
    const rows = getOwnershipDateRows(purchasedAt, "awaiting_collector");
    expect(rows).toHaveLength(2);
    expect(rows[1].value).toBe("Ready to claim on-chain");
  });

  it("formats the purchased date correctly in all cases", () => {
    const rows = getOwnershipDateRows(purchasedAt, "minted", "2026-02-01T00:00:00Z");
    expect(rows[0].value).toMatch(/Jan\s+15,\s+2026/);
  });

  it("returns claim row for minted status without claimedAt", () => {
    // minted but claimedAt is null — falls through to default
    const rows = getOwnershipDateRows(purchasedAt, "minted", null);
    expect(rows).toHaveLength(2);
    expect(rows[1].value).toBe("Ready to claim on-chain");
  });
});
