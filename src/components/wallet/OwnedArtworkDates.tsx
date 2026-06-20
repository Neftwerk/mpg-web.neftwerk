import {
  getOwnershipDateRows,
  type OwnershipDateRow,
} from "@/lib/owned-artwork-dates";
import type { OwnedAssetMintStatus } from "@/lib/wallet-service";

type OwnedArtworkDatesProps = {
  purchasedAt: string;
  mintStatus: OwnedAssetMintStatus;
  claimedAt?: string | null;
  /** wallet cards use a compact single-line layout */
  variant?: "stack" | "compact";
  className?: string;
};

function DateRow({
  row,
  variant,
}: {
  row: OwnershipDateRow;
  variant: "stack" | "compact";
}) {
  if (variant === "compact") {
    return (
      <p className="text-[11px] text-[#334E57]/70">
        <span className="font-semibold text-[#334E57]/85">{row.label}</span>
        {" · "}
        {row.value}
      </p>
    );
  }

  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <span className="text-[#616161]">{row.label}</span>
      <span className="font-medium text-[#1A3F6C] text-right">{row.value}</span>
    </div>
  );
}

export function OwnedArtworkDates({
  purchasedAt,
  mintStatus,
  claimedAt,
  variant = "stack",
  className = "",
}: OwnedArtworkDatesProps) {
  const rows = getOwnershipDateRows(purchasedAt, mintStatus, claimedAt);

  return (
    <div
      className={`${variant === "compact" ? "space-y-0.5" : "space-y-2"} ${className}`}
    >
      {rows.map((row) => (
        <DateRow key={row.label} row={row} variant={variant} />
      ))}
    </div>
  );
}
