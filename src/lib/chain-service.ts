import { API_ENDPOINTS } from "./api";
import { apiFetch } from "./auth-service";

export type ChainConfig = {
  network: "testnet" | "mainnet";
  rpcUrl: string;
  networkPassphrase: string;
  arts1FactoryContractId: string;
  neftwerkP256Pubkey: string;
  mintAuthAddress: string;
  defaultArtistAddress: string;
};

export async function fetchChainConfig(): Promise<ChainConfig> {
  const response = await apiFetch<{ data?: ChainConfig }>(API_ENDPOINTS.CHAIN.CONFIG);
  if (!response.ok || !response.data?.data) {
    throw new Error(response.message ?? "Could not load chain configuration.");
  }
  return response.data.data;
}
