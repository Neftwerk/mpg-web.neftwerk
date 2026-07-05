import type { OwnedAssetMintStatus } from "./wallet-service";

/** Short date for collection / wallet labels (e.g. "Mar 20, 2026"). */
export function formatOwnershipDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type OwnershipDateRow = {
  label: string;
  value: string;
};

/** Purchased row plus claim row (date or friendly status when not yet claimed). */
export function getOwnershipDateRows(
  purchasedAt: string,
  mintStatus: OwnedAssetMintStatus,
  claimedAt?: string | null,
): OwnershipDateRow[] {
  const rows: OwnershipDateRow[] = [
    { label: "Purchased", value: formatOwnershipDate(purchasedAt) },
  ];

  if (mintStatus === "minted" && claimedAt) {
    rows.push({ label: "Claimed", value: formatOwnershipDate(claimedAt) });
    return rows;
  }

  if (mintStatus === "queued") {
    rows.push({ label: "Claim", value: "Ready when you are" });
    return rows;
  }

  if (mintStatus === "failed") {
    rows.push({ label: "Claim", value: "Ready when you are" });
    return rows;
  }

  rows.push({ label: "Claim", value: "Ready to claim on-chain" });
  return rows;
}
