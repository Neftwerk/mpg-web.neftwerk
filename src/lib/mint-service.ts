import { API_ENDPOINTS } from "./api";
import { authedFetch } from "./auth-service";
import { fetchChainConfig } from "./chain-service";
import {
  authenticateSocketFi,
  requestArts1MintApprovalViaSocketFi,
} from "./socketfi-auth";
import {
  enrichSocketFiSession,
  getSocketFiAccessToken,
  getSocketFiCollectorPubkey,
  getSocketFiWalletAddress,
  getStoredSocketFiSession,
  hasClaimReadySocketFiSession,
  clearStoredSocketFiSession,
  setStoredSocketFiSession,
} from "./socketfi-session";
import { resolveSocketFiSession, verifySocketFiSessionViaBackend } from "./socketfi-wallet-service";
import type { SocketFiSession } from "@socketfi/react";

import { recoverCollectorPubkeyFromDigestSignature } from "./p256-collector-pubkey";
import type { MintPrepData, MintSubmitResult, RegisterOwnershipResult } from "./mint-types";

async function prepareSaleMint(
  saleId: string,
  body: {
    ownerAddress: string;
    collectorPubkey?: string;
    collectorSignature?: string;
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
  body: { collectorSignature: string; ownerAuth: string; collectorPubkey?: string },
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

async function ensureSocketFiSession(forceFresh = false): Promise<SocketFiSession> {
  if (!forceFresh) {
    const stored = getStoredSocketFiSession();
    if (stored && hasClaimReadySocketFiSession(stored)) {
      return enrichSocketFiSession(await resolveSocketFiSession(stored));
    }
  }

  clearStoredSocketFiSession();

  const auth = await authenticateSocketFi("wallet");
  if (!auth.ok) {
    throw new Error(auth.message ?? "Wallet authentication was cancelled.");
  }

  let session = enrichSocketFiSession(auth.session);
  if (!getSocketFiAccessToken(session)) {
    clearStoredSocketFiSession();
    throw new Error(
      "Wallet connected but SocketFi did not return an access token. Try Claim again.",
    );
  }

  session = await resolveSocketFiSession(session);

  const verified = await verifySocketFiSessionViaBackend(session);
  if (verified.ok) {
    session = enrichSocketFiSession({
      ...session,
      wallet: {
        ...(typeof session.wallet === "object" && session.wallet ? session.wallet : {}),
        address: verified.data.walletAddress,
        ...(verified.data.collectorPubkey ? { collectorPubkey: verified.data.collectorPubkey } : {}),
      },
      userProfile: {
        ...session.userProfile,
        ...(verified.data.username ? { username: verified.data.username } : {}),
        ...(verified.data.accountId ? { accountId: verified.data.accountId } : {}),
        id: verified.data.userId,
      },
    });
  }

  if (!getSocketFiWalletAddress(session)) {
    clearStoredSocketFiSession();
    if (!verified.ok && verified.message) {
      throw new Error(verified.message);
    }

    throw new Error(
      "Wallet connected but your smart wallet address could not be verified. Complete SocketFi wallet setup, then try Claim again.",
    );
  }

  if (!getSocketFiAccessToken(session)) {
    clearStoredSocketFiSession();
    throw new Error(
      "Wallet connected but SocketFi session is incomplete. Try Claim again.",
    );
  }

  return enrichSocketFiSession(session);
}

/** Full register-ownership flow: SocketFi auth → mint-prep → one claim popup → mint-submit. */
export async function registerSaleOwnership(saleId: string): Promise<RegisterOwnershipResult> {
  try {
    const session = await ensureSocketFiSession(true);
    setStoredSocketFiSession(session);

    const verified = await verifySocketFiSessionViaBackend(session);
    const ownerAddress = verified.ok
      ? verified.data.walletAddress
      : getSocketFiWalletAddress(session);

    if (!ownerAddress) {
      clearStoredSocketFiSession();
      return {
        ok: false,
        message: "Your smart wallet address is unavailable. Refresh the page and try Claim again.",
      };
    }

    const chainConfig = await fetchChainConfig();

    const prep = await prepareSaleMint(saleId, {
      ownerAddress,
      artistAddress: chainConfig.defaultArtistAddress || undefined,
    });

    try {
      const approval = await requestArts1MintApprovalViaSocketFi({
        session,
        prep,
        saleId,
      });

      let collectorPubkey =
        approval.collectorPubkey ??
        getSocketFiCollectorPubkey(session) ??
        recoverCollectorPubkeyFromDigestSignature(prep.mintAuthDigest, approval.signature);

      if (!collectorPubkey) {
        return {
          ok: false,
          message:
            "Wallet approved the claim but your passkey public key could not be determined. Try Claim again or contact support.",
        };
      }

      const submit = await submitSaleMint(saleId, {
        collectorSignature: approval.signature,
        ownerAuth: approval.ownerAuth!,
        collectorPubkey,
      });

      return { ok: true, data: submit };
    } catch (approvalError) {
      const message =
        approvalError instanceof Error ? approvalError.message : "Wallet approval failed.";
      if (message.toLowerCase().includes("cancel")) {
        return { ok: false, cancelled: true, message };
      }
      return { ok: false, message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Claim failed.";
    if (message.toLowerCase().includes("cancel")) {
      return { ok: false, cancelled: true, message };
    }
    return { ok: false, message };
  }
}
