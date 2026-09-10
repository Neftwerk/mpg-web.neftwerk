/**
 * StellarExpert links.
 *
 * Reads NEXT_PUBLIC_STELLAR_NETWORK. Defaults to testnet rather than throwing: a
 * missing env var should not break rendering a link.
 */
export type StellarNetwork = "TESTNET" | "MAINNET";

export function getStellarNetwork(): StellarNetwork {
  return process.env.NEXT_PUBLIC_STELLAR_NETWORK?.trim().toUpperCase() === "MAINNET"
    ? "MAINNET"
    : "TESTNET";
}

export function getStellarExplorerTxUrl(txHash: string): string {
  const network = getStellarNetwork() === "MAINNET" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${network}/tx/${txHash.trim().toLowerCase()}`;
}
