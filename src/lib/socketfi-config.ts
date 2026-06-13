import type { SocketFiConfig } from "@socketfi/react";

export type SocketFiNetwork = "TESTNET" | "MAINNET";

const SOCKETFI_NETWORKS: SocketFiNetwork[] = ["TESTNET", "MAINNET"];

/** Chain is determined solely by NEXT_PUBLIC_SOCKETFI_NETWORK. */
export function getSocketFiNetwork(): SocketFiNetwork {
  const raw = process.env.NEXT_PUBLIC_SOCKETFI_NETWORK?.trim().toUpperCase();
  if (!raw) {
    throw new Error("NEXT_PUBLIC_SOCKETFI_NETWORK is not configured");
  }

  if (!SOCKETFI_NETWORKS.includes(raw as SocketFiNetwork)) {
    throw new Error(
      `NEXT_PUBLIC_SOCKETFI_NETWORK must be TESTNET or MAINNET (received "${raw}")`,
    );
  }

  return raw as SocketFiNetwork;
}

export function isSocketFiMainnet(): boolean {
  return getSocketFiNetwork() === "MAINNET";
}

export function getSocketFiClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_SOCKETFI_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_SOCKETFI_CLIENT_ID is not configured");
  }
  return clientId;
}

export function getUsdTokenContractId(): string {
  const contractId = isSocketFiMainnet()
    ? process.env.NEXT_PUBLIC_USD_TOKEN_CONTRACT_ID_MAINNET
    : process.env.NEXT_PUBLIC_USD_TOKEN_CONTRACT_ID_TESTNET;

  if (!contractId) {
    throw new Error(
      isSocketFiMainnet()
        ? "NEXT_PUBLIC_USD_TOKEN_CONTRACT_ID_MAINNET is not configured"
        : "NEXT_PUBLIC_USD_TOKEN_CONTRACT_ID_TESTNET is not configured",
    );
  }

  return contractId;
}

export function getSocketFiConfig(): SocketFiConfig {
  return {
    clientId: getSocketFiClientId(),
    network: getSocketFiNetwork(),
    brand: {
      appName: "My Pocket Gallery",
      primaryColor: "#1A3F6C",
    },
    onAuthSuccess(session) {
      if (typeof window !== "undefined") {
        console.log("[SocketFi] onAuthSuccess callback", session);
      }
    },
  };
}
