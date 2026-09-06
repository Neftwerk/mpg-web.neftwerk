"use client";

import { ExternalLink } from "lucide-react";
import { getStellarExplorerTxUrl } from "@/lib/stellar-explorer";

type Props = {
  mintTxHash: string;
  className?: string;
};

export function StellarExplorerLink({ mintTxHash, className }: Props) {
  const hash = mintTxHash.trim();
  if (!hash) return null;

  return (
    <a
      href={getStellarExplorerTxUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-flex items-center justify-center text-[#1A3F6C]/70 hover:text-[#1A3F6C] transition-colors"
      }
      aria-label="View mint transaction on Stellar Expert"
      title="View on Stellar Expert"
      onClick={(event) => event.stopPropagation()}
    >
      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.25} />
    </a>
  );
}
