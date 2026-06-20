import { API_ENDPOINTS } from "./api";
import { authedFetch } from "./auth-service";
import {
  enrichSocketFiSession,
  getSocketFiAccessToken,
  getSocketFiWalletAddress,
} from "./socketfi-session";
import type { SocketFiSession } from "@socketfi/react";

export type VerifiedSocketFiSession = {
  userId: string;
  username?: string;
  accountId?: string;
  walletAddress: string;
  collectorPubkey?: string;
};

export async function verifySocketFiSessionViaBackend(
  session: SocketFiSession,
): Promise<{ ok: true; data: VerifiedSocketFiSession } | { ok: false; message?: string }> {
  const accessToken = getSocketFiAccessToken(session);
  if (!accessToken) {
    return { ok: false, message: "SocketFi access token is missing from the session." };
  }

  const response = await authedFetch<{ data?: VerifiedSocketFiSession }>(
    API_ENDPOINTS.WALLET.SOCKETFI_VERIFY,
    {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    },
  );

  if (!response.ok || !response.data?.data?.walletAddress) {
    console.warn("[SocketFi] backend verify failed:", response.message, response.data);
    return {
      ok: false,
      message:
        response.message ??
        "Could not verify your SocketFi wallet on the server. Try again or contact support.",
    };
  }

  return { ok: true, data: response.data.data };
}

/** Resolve wallet address via client session parsing, then trusted backend verification. */
export async function resolveSocketFiSession(
  session: SocketFiSession,
): Promise<SocketFiSession> {
  const enriched = enrichSocketFiSession(session);
  const accessToken = getSocketFiAccessToken(enriched);

  if (getSocketFiWalletAddress(enriched) && accessToken) {
    return enriched;
  }

  if (!accessToken) {
    return enriched;
  }

  const verified = await verifySocketFiSessionViaBackend(enriched);
  if (!verified.ok) {
    return enriched;
  }

  return enrichSocketFiSession({
    ...enriched,
    wallet: {
      ...(typeof enriched.wallet === "object" && enriched.wallet ? enriched.wallet : {}),
      address: verified.data.walletAddress,
      ...(verified.data.collectorPubkey ? { collectorPubkey: verified.data.collectorPubkey } : {}),
    },
    userProfile: {
      ...enriched.userProfile,
      ...(verified.data.username ? { username: verified.data.username } : {}),
      ...(verified.data.accountId ? { accountId: verified.data.accountId } : {}),
      id: verified.data.userId,
    },
  });
}