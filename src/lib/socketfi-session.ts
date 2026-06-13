import { Address } from "@stellar/stellar-sdk";
import type { SocketFiSession } from "@socketfi/react";

const SESSION_KEY = "socketfi_session";

/** Log SocketFi session details when auth succeeds (browser console only). */
export function logSocketFiConnected(session: SocketFiSession, source: string): void {
  if (typeof window === "undefined") return;

  console.log(`[SocketFi] connected successfully (${source})`, {
    userProfile: session.userProfile,
    wallet: session.wallet,
    accessToken: session.accessToken,
    session,
  });
}

export function getStoredSocketFiSession(): SocketFiSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SocketFiSession;
    if (!parsed?.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredSocketFiSession(session: SocketFiSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSocketFiSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

function collectAddressCandidates(session: SocketFiSession): string[] {
  const wallet = session.wallet as Record<string, unknown> | undefined;
  const profile = session.userProfile as Record<string, unknown> | undefined;
  const root = session as Record<string, unknown>;
  const profileWallet =
    profile?.wallet && typeof profile.wallet === "object"
      ? (profile.wallet as Record<string, unknown>)
      : undefined;

  return [
    root.address,
    wallet?.address,
    wallet?.walletAddress,
    wallet?.publicKey,
    wallet?.smartWalletAddress,
    wallet?.contractAddress,
    profile?.address,
    profile?.walletAddress,
    profileWallet?.address,
    profileWallet?.walletAddress,
    profileWallet?.publicKey,
  ].filter((value): value is string => typeof value === "string" && value.length > 0);
}

export function getSocketFiWalletAddress(session: SocketFiSession | null): string | undefined {
  if (!session) return undefined;
  return collectAddressCandidates(session)[0];
}

export function getSocketFiWalletAddressXdr(session: SocketFiSession | null): string | undefined {
  if (!session) return undefined;

  const wallet = session.wallet as Record<string, unknown> | undefined;
  const profile = session.userProfile as Record<string, unknown> | undefined;
  const root = session as Record<string, unknown>;
  const profileWallet =
    profile?.wallet && typeof profile.wallet === "object"
      ? (profile.wallet as Record<string, unknown>)
      : undefined;

  const xdrCandidates = [
    root.addressXdr,
    wallet?.addressXdr,
    wallet?.publicKeyXdr,
    wallet?.address_xdr,
    profile?.addressXdr,
    profileWallet?.addressXdr,
  ];

  for (const value of xdrCandidates) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  const address = getSocketFiWalletAddress(session);
  if (!address) return undefined;

  try {
    return Address.fromString(address).toScVal().toXDR("base64");
  } catch {
    return undefined;
  }
}
