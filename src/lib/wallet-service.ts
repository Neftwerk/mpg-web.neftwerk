import { API_ENDPOINTS } from "./api";
import { authedFetch } from "./auth-service";

export type OwnedAssetMintStatus = "not_started" | "queued" | "minted" | "failed";

export interface OwnedAsset {
  saleId: string;
  artworkId: string;
  title: string;
  description?: string;
  listPriceCents: number;
  royaltyBps: number;
  galleryId: string;
  galleryName?: string;
  collectionId: string;
  collectionName?: string;
  artistId: string;
  artistName?: string;
  mediaUrl: string;
  mediaExpiresAt?: string;
  mintStatus: OwnedAssetMintStatus;
  acquiredAt: string;
}

interface OwnedAssetsResponse {
  assets: OwnedAsset[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchOwnedAssets(): Promise<OwnedAsset[]> {
  const response = await authedFetch<{ data?: OwnedAssetsResponse }>(
    API_ENDPOINTS.SALES.MINE,
  );

  if (!response.ok) {
    throw new Error(response.message ?? "Could not load your collection.");
  }

  return response.data?.data?.assets ?? [];
}
