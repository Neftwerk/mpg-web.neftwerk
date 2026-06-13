import { getSocketFiClient } from "./socketfi";
import {
  logSocketFiConnected,
  setStoredSocketFiSession,
} from "./socketfi-session";
import type { SocketFiSession } from "@socketfi/react";

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
