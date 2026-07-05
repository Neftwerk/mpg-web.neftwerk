import { getSocketFiClient } from "./socketfi";
import { getSocketFiClientId } from "./socketfi-config";
import { openSocketFiHostedTransaction } from "./socketfi-hosted-transaction";
import {
  buildWalletDappInvokerArgsXdr,
  resolveWalletAuthValidUntilLedger,
} from "./build-wallet-dapp-invoker-args";
import type { MintPrepData } from "./mint-types";
import { API_ENDPOINTS } from "./api";
import { authedFetch } from "./auth-service";
import {
  enrichSocketFiSession,
  getSocketFiAccessToken,
  logSocketFiConnected,
  setStoredSocketFiSession,
} from "./socketfi-session";
import type { SocketFiSession } from "@socketfi/react";

type SocketFiError = Error & { code?: string };

function getSocketFiAppOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "this site";
}

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
  const message =
    err?.message ?? "Wallet authentication failed. Please try again.";

  if (err?.code === "USER_CANCELLED" || isUserCancelled(message)) {
    return { ok: false, cancelled: true, message };
  }

  if (isWebAuthnError(message)) {
    const origin = getSocketFiAppOrigin();
    return {
      ok: false,
      message: `Passkey authentication failed. Use a supported browser (Chrome or Safari), allow popups, complete the prompt within 60 seconds, and ensure ${origin} is registered in your SocketFi app settings.`,
    };
  }

  if (
    err?.code === "POPUP_BLOCKED" ||
    message.toLowerCase().includes("popup")
  ) {
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
  source: "buy" | "wallet"
): Promise<SocketFiAuthResult> {
  try {
    const rawSession = await getSocketFiClient().authenticate();
    const session = enrichSocketFiSession(rawSession);
    if (!getSocketFiAccessToken(session)) {
      return {
        ok: false,
        message:
          "Wallet connected but SocketFi did not return an access token. Try again.",
      };
    }
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

function normalizeCollectorPubkeyHex(value: string): string | undefined {
  const hex = value.replace(/^0x/i, "").toLowerCase();
  if (/^04[0-9a-f]{128}$/.test(hex)) return hex;

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    if (bytes.length === 65 && bytes[0] === 0x04) {
      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
    }
    if (bytes.length === 64) {
      return `04${Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("")}`;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function extractCollectorPubkey(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const record = result as Record<string, unknown>;
  const candidates = [
    record.collectorPubkey,
    record.p256PublicKey,
    record.secp256r1PublicKey,
    record.passkeyPublicKey,
    record.publicKey,
    record.publicKeyHex,
    record.credentialPublicKey,
  ];

  for (const value of candidates) {
    if (typeof value === "string") {
      const normalized = normalizeCollectorPubkeyHex(value);
      if (normalized) return normalized;
    }
  }

  const nested = record.data;
  if (nested && typeof nested === "object") {
    return extractCollectorPubkey(nested);
  }

  return undefined;
}

export type SignMintAuthDigestResult = {
  signature: string;
  collectorPubkey?: string;
  ownerAuth?: string;
  mintTxHash?: string;
};

export function buildArts1MintTxDetails(
  prep: MintPrepData,
  saleId: string,
  extras?: Record<string, unknown>
): Record<string, unknown> {
  const base = {
    arts1Mint: true,
    saleId,
    mintAuthDigest: prep.mintAuthDigest,
    neftwerkSignature: prep.neftwerkSignature,
    ownerAddress: prep.ownerAddress,
    artistAddress: prep.artistAddress,
    onChainArtworkId: prep.onChainArtworkId,
    metadataCid: prep.metadataCid,
    royaltyBps: prep.royaltyBps,
    primarySaleSplits: prep.primarySaleSplits,
    provenancePreimage: prep.provenancePreimage,
    network: prep.chain.network,
    networkPassphrase: prep.chain.networkPassphrase,
    arts1FactoryContractId: prep.chain.arts1FactoryContractId,
    neftwerkP256Pubkey: prep.chain.neftwerkP256Pubkey,
    mintAuthAddress: prep.chain.mintAuthAddress,
    ...(prep.provenancePreimageHash
      ? { provenancePreimageHash: prep.provenancePreimageHash }
      : {}),
    ...(prep.collectorPubkey ? { collectorPubkey: prep.collectorPubkey } : {}),
  };

  return {
    ...base,
    submitViaRelayer: false,
    ...extras,
  };
}

function formatSocketFiTransactionError(
  error: unknown,
  phase: string,
  context?: { factoryContractId?: string }
): Error {
  const err = error as SocketFiError & { details?: string; cause?: unknown };
  const parts = [
    err?.message,
    typeof err?.details === "string" ? err.details : undefined,
    err?.cause instanceof Error ? err.cause.message : undefined,
  ].filter((value): value is string => Boolean(value?.trim()));

  const raw = parts.join(" — ") || "Wallet approval failed.";
  console.error(`[SocketFi] ${phase} failed:`, error);

  if (
    raw.includes("MismatchingParameterLen") &&
    raw.includes("dapp_invoker")
  ) {
    const clientId = getSocketFiClientId();
    const origin = getSocketFiAppOrigin();
    return new Error(
      `SocketFi called wallet dapp_invoker with the wrong number of arguments (${phase}). Mint-prep succeeded; the wallet contract expects 7 parameters including passkey_sig and valid_until_ledger. If this persists after refreshing, ask SocketFi to verify ARTS-1 mint assembly for client ${clientId} on TESTNET (origin ${origin}).`
    );
  }

  if (raw.includes("#2155") || raw.includes("WindowTooLarge")) {
    return new Error(
      `The claim authorization window was too long for your SocketFi wallet (${phase}). Refresh the page and try Claim again immediately after the wallet popup opens.`
    );
  }

  if (raw.includes("#2145") || raw.includes("InvalidLedgerWindow")) {
    return new Error(
      `The claim authorization expired before it could be submitted (${phase}). Refresh and try Claim again.`
    );
  }

  if (
    raw.includes("UnreachableCodeReached") ||
    (raw.includes("WasmVm") &&
      raw.includes("InvalidAction") &&
      raw.includes("dapp_invoker"))
  ) {
    const clientId = getSocketFiClientId();
    const factory = context?.factoryContractId ?? "your ARTS-1 factory";
    const origin = getSocketFiAppOrigin();
    return new Error(
      `SocketFi simulated wallet dapp_invoker before your passkey signature was attached (${phase}). Mint-prep succeeded; the wallet needs a WebAuthn PasskeySignature, not empty invoke args. Ask SocketFi to enable the ARTS-1 mint handler for client ${clientId} on TESTNET (factory ${factory}, origin ${origin}) so their popup assembles dapp_invoker with passkey auth after you approve.`
    );
  }

  if (
    raw.includes("__check_auth") ||
    raw.includes("require_auth") ||
    (raw.includes("InvalidAction") &&
      raw.includes("Auth") &&
      !raw.includes("WasmVm"))
  ) {
    const clientId = getSocketFiClientId();
    const factory = context?.factoryContractId ?? "your ARTS-1 factory";
    const origin = getSocketFiAppOrigin();
    return new Error(
      `This mint must be authorized through your SocketFi smart wallet, not a direct factory call (${phase}). Mint-prep succeeded; the failure is in the SocketFi popup. Ask SocketFi to enable the ARTS-1 mint handler for client ${clientId} on TESTNET (factory ${factory}, origin ${origin}) so they assemble wallet dapp_invoker with passkey auth.`
    );
  }

  if (raw.toLowerCase().includes("prepare transaction")) {
    const clientId = getSocketFiClientId();
    const factory = context?.factoryContractId ?? "your ARTS-1 factory";
    const origin = getSocketFiAppOrigin();
    return new Error(
      `SocketFi could not prepare this claim transaction (${phase}): ${raw}. Mint-prep on Neftwerk succeeded; the failure is inside the SocketFi approval popup at auth.socket.fi. Ask SocketFi to enable the ARTS-1 relayer mint flow for client ${clientId} on TESTNET (factory ${factory}, origin ${origin}).`
    );
  }

  return new Error(raw);
}

function getSocketFiClientPaymaster(): string {
  return (
    process.env.NEXT_PUBLIC_SOCKETFI_CLIENT_PAYMASTER?.trim() ||
    "SERVER_SIDE_PAYMASTER"
  );
}

function extractSignedAuthEntriesXdr(result: unknown): string[] | undefined {
  if (!result || typeof result !== "object") return undefined;
  const record = result as Record<string, unknown>;
  const entries = record.signedAuthEntriesXdr;
  if (
    Array.isArray(entries) &&
    entries.length > 0 &&
    entries.every((entry) => typeof entry === "string")
  ) {
    return entries;
  }

  const nested = record.data;
  if (nested && typeof nested === "object") {
    return extractSignedAuthEntriesXdr(nested);
  }

  return undefined;
}

function extractInvokeArgsXdr(result: unknown): string[] | undefined {
  if (!result || typeof result !== "object") return undefined;
  const record = result as Record<string, unknown>;

  for (const key of [
    "argsXdr",
    "invokeArgsXdr",
    "dappInvokerArgsXdr",
    "callArgsXdr",
    "signedArgsXdr",
  ]) {
    const value = record[key];
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((entry) => typeof entry === "string")
    ) {
      return value;
    }
  }

  const nested = record.data;
  if (nested && typeof nested === "object") {
    return extractInvokeArgsXdr(nested);
  }

  return undefined;
}

async function buildArts1DappInvokerHostedPayload(opts: {
  prep: MintPrepData;
  saleId: string;
  targetFunction: string;
  targetArgsXdr: string[];
  txDetailsExtras?: Record<string, unknown>;
}): Promise<{
  validUntilLedger: number;
  dappInvokerArgsXdr: string[];
  txDetails: Record<string, unknown>;
}> {
  const validUntilLedger = await resolveWalletAuthValidUntilLedger(
    opts.prep.chain.rpcUrl
  );

  const dappInvokerArgsXdr = buildWalletDappInvokerArgsXdr({
    factoryContractId: opts.prep.chain.arts1FactoryContractId,
    targetFunction: opts.targetFunction,
    targetArgsXdr: opts.targetArgsXdr,
    validUntilLedger,
  });

  return {
    validUntilLedger,
    dappInvokerArgsXdr,
    txDetails: {
      ...buildArts1MintTxDetails(opts.prep, opts.saleId, opts.txDetailsExtras),
      arts1UseDappInvoker: true,
      invokeContractId: opts.prep.ownerAddress,
      invokeFunction: "dapp_invoker",
      mintArgsXdr: opts.targetArgsXdr,
      targetContractId: opts.prep.chain.arts1FactoryContractId,
      targetFunction: opts.targetFunction,
      walletAddress: opts.prep.ownerAddress,
      validUntilLedger,
      dappInvokerArgsXdr,
    },
  };
}

async function relaySignedWalletDappInvokerMint(opts: {
  session: SocketFiSession;
  prep: MintPrepData;
  saleId: string;
  targetFunction: string;
  targetArgsXdr: string[];
}): Promise<{ mintTxHash: string; raw: unknown }> {
  const accessToken = getSocketFiAccessToken(opts.session);
  if (!accessToken) {
    throw new Error(
      "SocketFi access token is missing. Reconnect your wallet and try Claim again."
    );
  }

  const hostedPayload = await buildArts1DappInvokerHostedPayload({
    prep: opts.prep,
    saleId: opts.saleId,
    targetFunction: opts.targetFunction,
    targetArgsXdr: opts.targetArgsXdr,
    txDetailsExtras: {
      arts1Phase: "mint",
      submitViaRelayer: true,
    },
  });

  // Full 7-arg skeleton (Void passkey placeholders). SocketFi must replace
  // passkey_sig after passkey approval; empty argsXdr causes MismatchingParameterLen.
  const signed = await openSocketFiHostedTransaction({
    accessToken,
    contractId: opts.prep.ownerAddress,
    callFunction: { name: "dapp_invoker" },
    argsXdr: hostedPayload.dappInvokerArgsXdr,
    txDetails: hostedPayload.txDetails,
    display: {
      title: "Claim artwork",
      description: `Mint ${opts.prep.onChainArtworkId} to your wallet`,
      action: "Authorize mint on Stellar",
      app: "Neftwerk",
    },
    clientPaymaster: getSocketFiClientPaymaster(),
    mode: "sign",
  });

  const signedAuthEntriesXdr = extractSignedAuthEntriesXdr(signed);
  if (!signedAuthEntriesXdr?.length) {
    throw new Error(
      "SocketFi did not return signedAuthEntriesXdr. Approve the transaction in your wallet popup and try Claim again."
    );
  }

  const invokeArgsXdr =
    extractInvokeArgsXdr(signed) ?? hostedPayload.dappInvokerArgsXdr;

  const relayResponse = await authedFetch<{
    data?: { mintTxHash?: string; status?: string };
  }>(API_ENDPOINTS.SALES.MINT_RELAY(opts.saleId), {
    method: "POST",
    body: JSON.stringify({
      contractId: opts.prep.ownerAddress,
      functionName: "dapp_invoker",
      argsXdr: invokeArgsXdr,
      signedAuthEntriesXdr,
    }),
  });

  if (!relayResponse.ok || !relayResponse.data?.data?.mintTxHash) {
    throw new Error(
      relayResponse.message ?? "Backend could not submit the signed mint."
    );
  }

  return {
    mintTxHash: relayResponse.data.data.mintTxHash,
    raw: { signed, relay: relayResponse.data.data },
  };
}

async function requestArts1MintTransaction(opts: {
  session: SocketFiSession;
  prep: MintPrepData;
  saleId: string;
  callFunction: { name: string };
  argsXdr: string[];
  txDetails: Record<string, unknown>;
  display: {
    title: string;
    description: string;
    action: string;
    app: string;
  };
  signOnly?: boolean;
  clientPaymaster?: string;
}): Promise<unknown> {
  const accessToken = getSocketFiAccessToken(opts.session);
  if (!accessToken) {
    throw new Error(
      "SocketFi access token is missing. Reconnect your wallet and try Claim again."
    );
  }

  // SocketFi wallets authorize external calls via dapp_invoker (passkey_sig in
  // invoke args). Direct factory.mint triggers owner.require_auth → __check_auth,
  // which these wallets do not implement.
  const hostedPayload = await buildArts1DappInvokerHostedPayload({
    prep: opts.prep,
    saleId: opts.saleId,
    targetFunction: opts.callFunction.name,
    targetArgsXdr: opts.argsXdr,
    txDetailsExtras: opts.txDetails,
  });

  return openSocketFiHostedTransaction({
    accessToken,
    contractId: opts.prep.ownerAddress,
    callFunction: { name: "dapp_invoker" },
    argsXdr: hostedPayload.dappInvokerArgsXdr,
    txDetails: hostedPayload.txDetails,
    display: opts.display,
    clientPaymaster: opts.clientPaymaster,
    mode: opts.signOnly ? "sign" : "sign_and_submit",
  });
}

/**
 * Phase 1: sign the mint auth digest with the passkey only (no full mint simulation).
 * Uses read-only `compute_mint_auth_digest` so SocketFi prepare does not simulate `mint`.
 */
export async function signArts1MintDigestViaSocketFi(opts: {
  session: SocketFiSession;
  prep: MintPrepData;
  saleId: string;
}): Promise<SignMintAuthDigestResult & { raw: unknown }> {
  const digestArgsXdr = opts.prep.mintDigestArgsXdr?.length
    ? opts.prep.mintDigestArgsXdr
    : opts.prep.mintArgsXdr?.slice(0, 7);

  if (!digestArgsXdr?.length) {
    throw new Error(
      "Mint preparation did not return digest arguments. Refresh and try Claim again."
    );
  }

  let txResult: unknown;
  try {
    txResult = await requestArts1MintTransaction({
      session: opts.session,
      prep: opts.prep,
      saleId: opts.saleId,
      callFunction: { name: "compute_mint_auth_digest" },
      argsXdr: digestArgsXdr,
      txDetails: buildArts1MintTxDetails(opts.prep, opts.saleId, {
        arts1Phase: "sign_digest",
        signDigestOnly: true,
        submitViaRelayer: false,
      }),
      display: {
        title: "Sign ownership proof",
        description: `Approve ownership of ${opts.prep.onChainArtworkId} with your passkey`,
        action: "Sign ownership proof",
        app: "Neftwerk",
      },
      signOnly: true,
      clientPaymaster: process.env.NEXT_PUBLIC_SOCKETFI_CLIENT_PAYMASTER,
    });
  } catch (error) {
    throw formatSocketFiTransactionError(error, "digest signing", {
      factoryContractId: opts.prep.chain.arts1FactoryContractId,
    });
  }

  const signature = extractCollectorSignature(txResult);
  const collectorPubkey = extractCollectorPubkey(txResult);

  if (!signature) {
    throw new Error(
      "Passkey signing completed but no collector signature was returned. Try Claim again or contact support."
    );
  }

  return {
    signature,
    collectorPubkey,
    raw: txResult,
  };
}

/**
 * Phase 2: authorize the mint invoke with the smart wallet after args include the real collector signature.
 */
export async function requestArts1MintOwnerAuthViaSocketFi(opts: {
  session: SocketFiSession;
  prep: MintPrepData;
  saleId: string;
  collectorSignature: string;
}): Promise<SignMintAuthDigestResult & { raw: unknown }> {
  if (!opts.prep.mintArgsXdr?.length) {
    throw new Error(
      "Mint preparation did not return transaction arguments. Try Claim again."
    );
  }

  let txResult: unknown;

  try {
    txResult = await requestArts1MintTransaction({
      session: opts.session,
      prep: opts.prep,
      saleId: opts.saleId,
      callFunction: { name: "mint" },
      argsXdr: opts.prep.mintArgsXdr,
      txDetails: buildArts1MintTxDetails(opts.prep, opts.saleId, {
        arts1Phase: "owner_auth",
        skipDigestSign: true,
        submitViaRelayer: false,
        collectorSignature: opts.collectorSignature,
      }),
      display: {
        title: "Claim artwork",
        description: `Mint ${opts.prep.onChainArtworkId} to your wallet`,
        action: "Authorize mint on Stellar",
        app: "Neftwerk",
      },
      signOnly: true,
      clientPaymaster: process.env.NEXT_PUBLIC_SOCKETFI_CLIENT_PAYMASTER,
    });
  } catch (error) {
    throw formatSocketFiTransactionError(error, "owner authorization", {
      factoryContractId: opts.prep.chain.arts1FactoryContractId,
    });
  }

  const ownerAuth = extractOwnerAuthXdr(txResult);
  const collectorPubkey = extractCollectorPubkey(txResult);

  if (!ownerAuth) {
    throw new Error(
      "Wallet approved the claim but did not return owner authorization for relayer submit. Try Claim again or contact support."
    );
  }

  return {
    signature: opts.collectorSignature,
    ownerAuth,
    collectorPubkey,
    raw: txResult,
  };
}

/**
 * ARTS-1 claim: one SocketFi popup mints on-chain and returns the transaction hash.
 */
export async function requestArts1MintApprovalViaSocketFi(opts: {
  session: SocketFiSession;
  prep: MintPrepData;
  saleId: string;
}): Promise<SignMintAuthDigestResult & { raw: unknown }> {
  if (!opts.prep.mintArgsXdr?.length) {
    throw new Error(
      "Mint preparation did not return transaction arguments. Try Claim again."
    );
  }

  let txResult: unknown;
  let mintTxHash: string | undefined;

  const mintTxDetails = buildArts1MintTxDetails(opts.prep, opts.saleId, {
    arts1Phase: "mint",
    submitViaRelayer: false,
  });

  const mintDisplay = {
    title: "Claim artwork",
    description: `Mint ${opts.prep.onChainArtworkId} to your wallet`,
    action: "Authorize mint on Stellar",
    app: "Neftwerk",
  };

  // Prefer sign + backend relay: sign_and_submit sometimes routes factory.mint
  // directly and hits __check_auth (wallet has no __check_auth; needs dapp_invoker).
  try {
    const relayed = await relaySignedWalletDappInvokerMint({
      session: opts.session,
      prep: opts.prep,
      saleId: opts.saleId,
      targetFunction: "mint",
      targetArgsXdr: opts.prep.mintArgsXdr,
    });
    mintTxHash = relayed.mintTxHash;
    txResult = relayed.raw;
  } catch (relayError) {
    console.warn(
      "[SocketFi] sign + relay mint failed, trying sign_and_submit:",
      relayError
    );
    mintTxHash = undefined;
    txResult = undefined;
  }

  if (!mintTxHash) {
    try {
      txResult = await requestArts1MintTransaction({
        session: opts.session,
        prep: opts.prep,
        saleId: opts.saleId,
        callFunction: { name: "mint" },
        argsXdr: opts.prep.mintArgsXdr,
        txDetails: mintTxDetails,
        display: mintDisplay,
        signOnly: false,
        clientPaymaster: getSocketFiClientPaymaster(),
      });
      mintTxHash = extractTransactionHash(txResult);
    } catch (submitError) {
      throw formatSocketFiTransactionError(submitError, "mint approval", {
        factoryContractId: opts.prep.chain.arts1FactoryContractId,
      });
    }
  }

  const signature = extractCollectorSignature(txResult);
  const collectorPubkey = extractCollectorPubkey(txResult);

  if (!mintTxHash) {
    throw new Error(
      "Wallet approved the claim but did not return a transaction hash. Try Claim again or contact support."
    );
  }

  return {
    signature: signature ?? "",
    mintTxHash,
    collectorPubkey,
    raw: txResult,
  };
}

export function extractTransactionHash(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const record = result as Record<string, unknown>;

  const direct = [
    record.txHash,
    record.transactionHash,
    record.hash,
    record.stellarTransactionHash,
    record.sorobanTransactionHash,
  ];

  for (const value of direct) {
    if (typeof value === "string" && /^[0-9a-fA-F]{64}$/.test(value)) {
      return value.toLowerCase();
    }
  }

  const nested = record.data;
  if (nested && typeof nested === "object") {
    return extractTransactionHash(nested);
  }

  return undefined;
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

  const signedEntries = record.signedAuthEntriesXdr;
  if (Array.isArray(signedEntries)) {
    for (const entry of signedEntries) {
      if (typeof entry === "string" && entry.length > 16) return entry;
    }
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
