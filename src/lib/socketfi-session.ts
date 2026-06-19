import { Address } from "@stellar/stellar-sdk";
import type { SocketFiSession } from "@socketfi/react";

const SESSION_KEY = "socketfi_session";
const STELLAR_ADDRESS_RE = /^[CG][A-Z2-7]{55}$/;

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

function decodeJwtPayload(accessToken: string): Record<string, unknown> | null {
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    if (typeof atob !== "function") return null;
    const json = atob(padded);

    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function walkForStellarAddress(value: unknown, depth = 0): string | undefined {
  if (depth > 8) return undefined;

  if (typeof value === "string" && STELLAR_ADDRESS_RE.test(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = walkForStellarAddress(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  if (isPlainObject(value)) {
    for (const candidate of Object.values(value)) {
      const found = walkForStellarAddress(candidate, depth + 1);
      if (found) return found;
    }
  }

  return undefined;
}

function walkForCollectorPubkey(value: unknown, depth = 0): string | undefined {
  if (depth > 8) return undefined;

  if (typeof value === "string") {
    const normalized = normalizeCollectorPubkeyHex(value);
    if (normalized) return normalized;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = walkForCollectorPubkey(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  if (isPlainObject(value)) {
    for (const candidate of Object.values(value)) {
      const found = walkForCollectorPubkey(candidate, depth + 1);
      if (found) return found;
    }
  }

  return undefined;
}

/** Merge wallet/profile fields from the JWT access token into the session object. */
export function enrichSocketFiSession(session: SocketFiSession): SocketFiSession {
  const payload = decodeJwtPayload(session.accessToken);
  if (!payload) return session;

  const jwtWallet = payload.wallet;
  const mergedWallet = {
    ...(isPlainObject(session.wallet) ? session.wallet : {}),
    ...(typeof jwtWallet === "string" ? { address: jwtWallet } : {}),
    ...(isPlainObject(jwtWallet) ? jwtWallet : {}),
  };

  const mergedProfile = {
    ...(isPlainObject(session.userProfile) ? session.userProfile : {}),
    ...(typeof payload.username === "string" ? { username: payload.username } : {}),
    ...(typeof payload.accountId === "string" ? { accountId: payload.accountId } : {}),
  };

  return {
    ...session,
    ...(Object.keys(mergedWallet).length > 0 ? { wallet: mergedWallet } : {}),
    userProfile: mergedProfile,
  };
}

export function getStoredSocketFiSession(): SocketFiSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SocketFiSession;
    if (!parsed?.accessToken) return null;
    return enrichSocketFiSession(parsed);
  } catch {
    return null;
  }
}

export function setStoredSocketFiSession(session: SocketFiSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(enrichSocketFiSession(session)));
}

export function clearStoredSocketFiSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

function collectAddressCandidates(session: SocketFiSession): string[] {
  const enriched = enrichSocketFiSession(session);
  const wallet = enriched.wallet as Record<string, unknown> | undefined;
  const profile = enriched.userProfile as Record<string, unknown> | undefined;
  const root = enriched as Record<string, unknown>;
  const profileWallet =
    profile?.wallet && typeof profile.wallet === "object"
      ? (profile.wallet as Record<string, unknown>)
      : undefined;
  const payload = decodeJwtPayload(enriched.accessToken);

  const explicit = [
    root.address,
    payload?.accountId,
    wallet?.address,
    wallet?.walletAddress,
    wallet?.publicKey,
    wallet?.smartWalletAddress,
    wallet?.contractAddress,
    wallet?.contractId,
    profile?.address,
    profile?.accountId,
    profile?.walletAddress,
    profileWallet?.address,
    profileWallet?.walletAddress,
    profileWallet?.publicKey,
  ].filter(
    (value): value is string =>
      typeof value === "string" && STELLAR_ADDRESS_RE.test(value),
  );

  const discovered = [
    walkForStellarAddress(wallet),
    walkForStellarAddress(profile),
    walkForStellarAddress(payload?.wallet),
    walkForStellarAddress(payload),
  ].filter((value): value is string => typeof value === "string");

  return [...new Set([...explicit, ...discovered])];
}

export function getSocketFiWalletAddress(session: SocketFiSession | null): string | undefined {
  if (!session) return undefined;
  return collectAddressCandidates(session)[0];
}

function normalizeCollectorPubkeyHex(value: string): string | undefined {
  const hex = value.replace(/^0x/i, "").toLowerCase();
  if (/^04[0-9a-f]{128}$/.test(hex)) return hex;
  return undefined;
}

/** 65-byte uncompressed P-256 public key (04 + 128 hex) for ARTS-1 collector_sig. */
export function getSocketFiCollectorPubkey(session: SocketFiSession | null): string | undefined {
  if (!session) return undefined;

  const wallet = session.wallet as Record<string, unknown> | undefined;
  const profile = session.userProfile as Record<string, unknown> | undefined;
  const root = session as Record<string, unknown>;
  const credential =
    profile?.credential && typeof profile.credential === "object"
      ? (profile.credential as Record<string, unknown>)
      : undefined;
  const passkey =
    profile?.passkey && typeof profile.passkey === "object"
      ? (profile.passkey as Record<string, unknown>)
      : undefined;

  const candidates = [
    root.collectorPubkey,
    root.p256PublicKey,
    root.secp256r1PublicKey,
    wallet?.collectorPubkey,
    wallet?.p256PublicKey,
    wallet?.secp256r1PublicKey,
    wallet?.passkeyPublicKey,
    profile?.collectorPubkey,
    profile?.p256PublicKey,
    profile?.secp256r1PublicKey,
    credential?.publicKey,
    credential?.p256PublicKey,
    passkey?.publicKey,
    passkey?.p256PublicKey,
  ];

  for (const value of candidates) {
    if (typeof value === "string") {
      const normalized = normalizeCollectorPubkeyHex(value);
      if (normalized) return normalized;
    }
  }

  const payload = decodeJwtPayload(session.accessToken);
  return (
    walkForCollectorPubkey(session.wallet) ??
    walkForCollectorPubkey(session.userProfile) ??
    walkForCollectorPubkey(payload?.wallet) ??
    walkForCollectorPubkey(payload)
  );
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
