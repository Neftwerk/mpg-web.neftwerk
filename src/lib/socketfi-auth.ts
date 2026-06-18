import { getSocketFiClient } from "./socketfi";
import { getSocketFiClientId, getSocketFiNetwork } from "./socketfi-config";
import {
  logSocketFiConnected,
  setStoredSocketFiSession,
} from "./socketfi-session";
import type { SocketFiSession } from "@socketfi/react";

const SOCKETFI_API_URL = "https://api.socket.fi";

const SIGN_DIGEST_PATHS = [
  "/api/passkey/sign-digest",
  "/api/p256/sign-digest",
  "/api/sign/digest",
] as const;

type SocketFiError = Error & { code?: string };

export type SocketFiAuthResult =
  | { ok: true; session: SocketFiSession }
  | { ok: false; cancelled?: boolean; message?: string };

function isUserCancelled(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("cancel") ||
    lower.includes("closed") ||
    lower.includes("user cancelled")
  );
}

function isWebAuthnError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("webauthn") ||
    lower.includes("timed out or was not allowed") ||
    lower.includes("notallowederror") ||
    lower.includes("not allowed")
  );
}

function mapSocketFiError(error: unknown): SocketFiAuthResult {
  const err = error as SocketFiError;
  const message = err?.message ?? "Wallet authentication failed. Please try again.";

  if (err?.code === "USER_CANCELLED" || isUserCancelled(message)) {
    return { ok: false, cancelled: true, message };
  }

  if (isWebAuthnError(message)) {
    return {
      ok: false,
      message:
        "Passkey authentication failed. Use a supported browser (Chrome or Safari), allow popups, complete the prompt within 60 seconds, and ensure http://localhost:3000 is registered in your SocketFi app settings.",
    };
  }

  if (err?.code === "POPUP_BLOCKED" || message.toLowerCase().includes("popup")) {
    return {
      ok: false,
      message:
        "The wallet popup was blocked. Please allow popups for this site and try again.",
    };
  }

  if (err?.code === "INVALID_CLIENT_ID") {
    return {
      ok: false,
      message: "Wallet configuration error. Please contact support.",
    };
  }

  return { ok: false, message };
}

/** Authenticate with SocketFi (user gesture required). */
export async function authenticateSocketFi(
  source: "buy" | "wallet",
): Promise<SocketFiAuthResult> {
  try {
    const session = await getSocketFiClient().authenticate();
    setStoredSocketFiSession(session);
    logSocketFiConnected(session, source);
    return { ok: true, session };
  } catch (error) {
    console.error("[SocketFi] authenticate failed:", error);
    return mapSocketFiError(error);
  }
}

/** Authenticate with SocketFi when the user clicks Buy. */
export async function authenticateSocketFiForPurchase(): Promise<SocketFiAuthResult> {
  return authenticateSocketFi("buy");
}

function extractSignatureHex(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  const candidates = [
    record.signature,
    record.collectorSignature,
    record.sig,
    record.p256Signature,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && /^[0-9a-f]{128}$/i.test(value)) {
      return value.toLowerCase();
    }
  }

  const nested = record.data;
  if (nested && typeof nested === "object") {
    return extractSignatureHex(nested);
  }

  return undefined;
}

/** Ask SocketFi to sign the ARTS-1 mint auth digest with the user's passkey. */
export async function signMintAuthDigestViaSocketFi(opts: {
  session: SocketFiSession;
  digestHex: string;
}): Promise<string> {
  const origin = window.location.origin;
  const body = {
    clientId: getSocketFiClientId(),
    network: getSocketFiNetwork(),
    origin,
    digest: opts.digestHex.replace(/^0x/i, "").toLowerCase(),
    mintAuthDigest: opts.digestHex.replace(/^0x/i, "").toLowerCase(),
  };

  for (const path of SIGN_DIGEST_PATHS) {
    try {
      const response = await fetch(`${SOCKETFI_API_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.session.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) continue;

      const data = await response.json().catch(() => null);
      const signature = extractSignatureHex(data);
      if (signature) return signature;
    } catch {
      continue;
    }
  }

  throw new Error(
    "Could not sign the ownership proof with your passkey. SocketFi digest signing is not available yet — contact support or retry after updating the wallet app.",
  );
}

export function extractOwnerAuthXdr(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const record = result as Record<string, unknown>;

  const direct = [
    record.ownerAuth,
    record.ownerAuthXdr,
    record.sorobanAuthorizationEntry,
    record.authorizationEntry,
    record.authEntryXdr,
    record.signedOwnerAuth,
  ];

  for (const value of direct) {
    if (typeof value === "string" && value.length > 16) return value;
  }

  const entries = record.authorizationEntries;
  if (Array.isArray(entries)) {
    for (const entry of entries) {
      if (typeof entry === "string" && entry.length > 16) return entry;
    }
  }

  const nested = record.data;
  if (nested && typeof nested === "object") {
    return extractOwnerAuthXdr(nested);
  }

  return undefined;
}

export function extractCollectorSignature(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const record = result as Record<string, unknown>;
  const sig = extractSignatureHex(record);
  if (sig) return sig;

  const nested = record.data;
  if (nested && typeof nested === "object") {
    return extractCollectorSignature(nested);
  }

  return undefined;
}
