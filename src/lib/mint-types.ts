import type { ChainConfig } from "./chain-service";

export type MintPrepData = {
  saleId: string;
  mintStatus: string;
  artworkId: string;
  onChainArtworkId: string;
  metadataCid: string;
  royaltyBps: number;
  ownerAddress: string;
  artistAddress: string;
  collectorPubkey?: string;
  primarySaleSplits: Array<{ address: string; bps: number; role: string }>;
  provenancePreimage: string;
  provenancePreimageHash?: string;
  mintAuthDigest: string;
  neftwerkSignature: string;
  /** Args for read-only `compute_mint_auth_digest` (digest signing popup). */
  mintDigestArgsXdr: string[];
  mintArgsXdr: string[];
  chain: ChainConfig;
};

export type MintSubmitResult = {
  saleId: string;
  mintStatus: string;
  mintTxHash?: string;
  mintedAt?: string;
  transactionId?: string;
  onChainArtworkId?: string;
  ownerAddress?: string;
};

export type RegisterOwnershipResult =
  | { ok: true; data: MintSubmitResult }
  | { ok: false; cancelled?: boolean; message: string };
