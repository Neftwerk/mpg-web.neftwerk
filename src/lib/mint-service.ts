import { API_ENDPOINTS } from "./api";
import { authedFetch } from "./auth-service";
import { fetchChainConfig } from "./chain-service";
import { buildMintArgsXdr } from "./mint-soroban-args";
import {
  authenticateSocketFi,
  extractCollectorSignature,
  extractOwnerAuthXdr,
  signMintAuthDigestViaSocketFi,
} from "./socketfi-auth";
import { getSocketFiClient } from "./socketfi";
import {
  getSocketFiCollectorPubkey,
  getSocketFiWalletAddress,
  getStoredSocketFiSession,
  setStoredSocketFiSession,
} from "./socketfi-session";
import type { SocketFiSession } from "@socketfi/react";

import type { MintPrepData, MintSubmitResult, RegisterOwnershipResult } from "./mint-types";

async function prepareSaleMint(
  saleId: string,
  body: {
    ownerAddress: string;
    collectorPubkey: string;
    artistAddress?: string;
  },
): Promise<MintPrepData> {
  const response = await authedFetch<{ data?: MintPrepData }>(
    API_ENDPOINTS.SALES.MINT_PREP(saleId),
    { method: "POST", body: JSON.stringify(body) },
  );

  if (!response.ok || !response.data?.data) {
    throw new Error(response.message ?? "Mint preparation failed.");
  }

  return response.data.data;
}

async function submitSaleMint(
  saleId: string,
  body: { collectorSignature: string; ownerAuth: string },
): Promise<MintSubmitResult> {
  const response = await authedFetch<{ data?: MintSubmitResult }>(
    API_ENDPOINTS.SALES.MINT_SUBMIT(saleId),
    { method: "POST", body: JSON.stringify(body) },
  );

  if (!response.ok || !response.data?.data) {
    throw new Error(response.message ?? "Mint submission failed.");
  }

  return response.data.data;
}

async function ensureSocketFiSession(): Promise<SocketFiSession> {
  const stored = getStoredSocketFiSession();
  if (stored?.accessToken) return stored;

  const auth = await authenticateSocketFi("wallet");
  if (!auth.ok) {
    throw new Error(auth.message ?? "Wallet authentication was cancelled.");
  }

  return auth.session;
}

/** Full register-ownership flow: SocketFi auth → mint-prep → sign → mint-submit. */
export async function registerSaleOwnership(saleId: string): Promise<RegisterOwnershipResult> {
  try {
    const session = await ensureSocketFiSession();
    setStoredSocketFiSession(session);

    const ownerAddress = getSocketFiWalletAddress(session);
    const collectorPubkey = getSocketFiCollectorPubkey(session);

    if (!ownerAddress) {
      return {
        ok: false,
        message: "Your smart wallet address is unavailable. Reconnect your wallet and try again.",
      };
    }

    if (!collectorPubkey) {
      return {
        ok: false,
        message:
          "Your passkey public key is not available from SocketFi. Reconnect your wallet or contact support.",
      };
    }

    const chainConfig = await fetchChainConfig();

    const prep = await prepareSaleMint(saleId, {
      ownerAddress,
      collectorPubkey,
      artistAddress: chainConfig.defaultArtistAddress || undefined,
    });

    let collectorSignature: string;
    try {
      collectorSignature = await signMintAuthDigestViaSocketFi({
        session,
        digestHex: prep.mintAuthDigest,
      });
    } catch (digestError) {
      const message =
        digestError instanceof Error ? digestError.message : "Passkey signing failed.";
      return { ok: false, message };
    }

    const argsXdr = await buildMintArgsXdr(prep, collectorSignature);
    const client = getSocketFiClient();

    let txResult: unknown;
    try {
      txResult = await client.requestTransaction({
        accessToken: session.accessToken,
        contractId: prep.chain.arts1FactoryContractId,
        callFunction: { name: "mint" },
        argsXdr,
        txDetails: {
          arts1Mint: true,
          saleId,
          mintAuthDigest: prep.mintAuthDigest,
          submitViaRelayer: true,
        },
        display: {
          title: "Register ownership",
          description: `Mint ${prep.onChainArtworkId} to your wallet`,
          action: "Register artwork ownership on Stellar",
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction approval failed.";
      if (message.toLowerCase().includes("cancel")) {
        return { ok: false, cancelled: true, message };
      }
      return { ok: false, message };
    }

    const ownerAuth =
      extractOwnerAuthXdr(txResult) ??
      (typeof txResult === "object" &&
      txResult &&
      "ownerAuth" in txResult &&
      typeof (txResult as { ownerAuth?: string }).ownerAuth === "string"
        ? (txResult as { ownerAuth: string }).ownerAuth
        : undefined);

    const collectorFromTx = extractCollectorSignature(txResult);
    if (collectorFromTx) {
      collectorSignature = collectorFromTx;
    }

    if (!ownerAuth) {
      return {
        ok: false,
        message:
          "Wallet approved the transaction but did not return owner authorization for relayer submit. SocketFi may need an ARTS-1 integration update.",
      };
    }

    const submit = await submitSaleMint(saleId, {
      collectorSignature,
      ownerAuth,
    });

    return { ok: true, data: submit };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Register ownership failed.";
    if (message.toLowerCase().includes("cancel")) {
      return { ok: false, cancelled: true, message };
    }
    return { ok: false, message };
  }
}
