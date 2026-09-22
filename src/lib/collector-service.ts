import { API_ENDPOINTS } from "./api";
import { authedFetch } from "./auth-service";

// ─── Shapes, mirroring the backend service interfaces ───

export type KycStage = "tos" | "kyc" | "complete";

export interface KycState {
  stage: KycStage;
  /** Hosted Bridge/Persona page for the current stage. Absent once complete. */
  link?: string;
  status: string;
  /**
   * Bridge's KYC flow status, distinct from the customer `status` above:
   * `not_started`, `incomplete`, `awaiting_questionnaire`, `awaiting_ubo`,
   * `under_review`, `approved`, `rejected`, `paused`, `offboarded`,
   * `deposits_restricted`.
   */
  kycStatus?: string;
  /**
   * Passed through from Bridge and deliberately untyped: an unrecognised capability
   * must not break parsing of the ones we do read.
   */
  capabilities?: Record<string, unknown>;
  /** The gate for funding — from the capability, not from `status`. */
  canPayInFiat: boolean;
}

export interface CollectorWallet {
  walletId: string;
  address: string;
  /** False when an existing wallet was returned rather than a new one created. */
  created: boolean;
}

export interface WalletAccountState {
  /** Null until the wallet has been created. */
  address: string | null;
  exists: boolean;
  hasUsdcTrustline: boolean;
  usdcBalance: string;
  /** Absent on the no-wallet-yet response. */
  xlmBalance?: string;
}

export interface ActivationEnvelope {
  /** Sponsor-signed transaction. Decode this before signing. */
  xdr: string;
  /** 32-byte hash, hex. */
  hash: string;
  address: string;
}

export interface ActivationResult {
  hash: string;
  address: string;
}

export interface DepositQuote {
  /** The artwork price — what must remain after the fee. */
  net: string;
  /** What the collector wires. */
  gross: string;
  fee: string;
  feePercent: number;
  belowMinimum: boolean;
  minimum: string;
}

export interface DepositAccount {
  id: string;
  status: string;
  /**
   * Bridge's own field names, passed through verbatim — render generically rather
   * than picking fields out, since they vary by payment rail.
   */
  deposit_instructions?: Record<string, unknown>;
  /**
   * `blockchain_memo` is Bridge's requirement, not ours, and nothing here reads it:
   * our wallets are one per collector, not pooled, so there is nothing to route.
   */
  destination: {
    currency: string;
    payment_rail: string;
    address: string;
    blockchain_memo?: string;
  };
  created_at: string;
}

/**
 * The deposit ledger, plus whatever transfer is outstanding.
 *
 * The announcement rides along with the deposits so a collector who reloads during
 * the day or two a bank transfer takes still sees that we are expecting it.
 */
export interface DepositLedger {
  deposits: Deposit[];
  /** ISO timestamp of when they said they had sent it, or null. */
  awaitingSince: string | null;
  /** What they were told to wire, so the waiting message can name it. */
  expectedGross: string | null;
}

/**
 * A USDC payment on the collector's account, in either direction.
 *
 * Named `Deposit` after the backend model, which predates it holding purchases.
 * Both are recorded now, so this is a statement line rather than a funding record.
 */
export interface Deposit {
  _id: string;
  /** `in` credits the wallet, `out` debits it. */
  direction: "in" | "out";
  /** The other side: the payer for `in`, the payee for `out`. */
  counterparty: string;
  amount: string;
  assetCode: string;
  transactionHash: string;
  /** Present on rows written before `counterparty` existed. */
  from: string;
  ledgerCloseAt: string;
  expectedAmount?: string;
  /** observed − expected. A persistent non-zero value means our fee mirror is stale. */
  feeDrift?: string;
}

// ─── Transport ───

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string; status?: number };

/**
 * Every collector endpoint answers `{ success: true, data: … }`, so the payload sits
 * one level in.
 *
 * The backend's error `code` is carried through deliberately: the onboarding UI
 * branches on `WALLET_NOT_CREATED`, `ALREADY_ACTIVE`, `NO_TRUSTLINE` and friends,
 * and matching on prose would break the first time a message is reworded.
 */
const request = async <T>(
  url: string,
  options: { method?: string; body?: unknown } = {},
): Promise<Result<T>> => {
  const res = await authedFetch<{ data?: T }>(url, {
    method: options.method ?? "GET",
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });

  if (!res.ok) {
    const body = res.data as { code?: string } | undefined;
    return {
      ok: false,
      message: res.message ?? "Request failed",
      code: body?.code,
      // Carried so a caller can tell "you are not signed in" from "this failed".
      status: res.status,
    };
  }

  if (res.data?.data === undefined) {
    return { ok: false, message: "The server returned no data" };
  }

  return { ok: true, data: res.data.data };
};

// ─── Wallet ───

export const createCollectorWallet = () =>
  request<CollectorWallet>(API_ENDPOINTS.COLLECTOR.CREATE_WALLET, { method: "POST" });

export const getCollectorWallet = () =>
  request<WalletAccountState>(API_ENDPOINTS.COLLECTOR.WALLET);

// ─── Identity verification ───

/**
 * Asks the backend for the next hosted page in the verification flow.
 *
 * `clientAgreementId` is Bridge's `signedAgreementId`, which its embedded terms page
 * posts to the parent window on acceptance. Passing it is how the acceptance is tied
 * to the KYC link; omitting it still works, because Privy records the acceptance
 * server-side either way.
 */
export const startKyc = (clientAgreementId?: string) =>
  request<KycState>(API_ENDPOINTS.COLLECTOR.KYC_START, {
    method: "POST",
    // `request` serialises this, so it takes the object rather than a string — and
    // no body at all when there is nothing to send, which is the ordinary case.
    ...(clientAgreementId ? { body: { clientAgreementId } } : {}),
  });

export const getKycStatus = () => request<KycState>(API_ENDPOINTS.COLLECTOR.KYC_STATUS);

/**
 * Tells the backend the collector says they have made the bank transfer.
 *
 * Takes no amount — the quote already recorded what they were told to send, and
 * passing one here would let the claim disagree with the instruction on screen.
 *
 * Nothing verifies the claim, so it only drives the waiting message. On testnet the
 * backend also settles from the vault, standing in for the bank, because Bridge
 * sandbox accepts the transfer and never delivers the USDC.
 */
export const announceTransfer = () =>
  request<DepositLedger>(API_ENDPOINTS.COLLECTOR.ANNOUNCE_TRANSFER, { method: "POST" });

/**
 * Sandbox only — the route does not exist on mainnet.
 *
 * Bridge never approves sandbox customers on its own, so this is the only way to
 * reach activation and funding in a test environment.
 */
export const simulateKycApproval = () =>
  request<KycState>(API_ENDPOINTS.COLLECTOR.SIMULATE_KYC, { method: "POST" });

// ─── Activation ───

export const startActivation = () =>
  request<ActivationEnvelope>(API_ENDPOINTS.COLLECTOR.ACTIVATION, { method: "POST" });

/** No address is sent: the backend verifies against the one it has on record. */
export const submitActivation = (input: { xdr: string; signature: string }) =>
  request<ActivationResult>(API_ENDPOINTS.COLLECTOR.ACTIVATION_SUBMIT, {
    method: "POST",
    body: input,
  });

// ─── Funding ───

export const createDepositAccount = () =>
  request<DepositAccount>(API_ENDPOINTS.COLLECTOR.CREATE_DEPOSIT_ACCOUNT, {
    method: "POST",
  });

/** Resolves with `null` when the collector has no deposit account yet. */
export const getDepositAccount = () =>
  request<DepositAccount | null>(API_ENDPOINTS.COLLECTOR.DEPOSIT_ACCOUNT);

export const listDeposits = () =>
  request<DepositLedger>(API_ENDPOINTS.COLLECTOR.DEPOSITS);

export const getDepositQuote = (priceUsd: number) =>
  request<DepositQuote>(API_ENDPOINTS.COLLECTOR.DEPOSIT_QUOTE(priceUsd));

// ─── Payment PIN ───

/**
 * The PIN endpoints answer 204 with an empty body, deliberately: nothing about a
 * PIN's state needs writing into a response. `request` reads a missing `data` as a
 * failure, which is right for every other endpoint here and wrong for these.
 */
const requestEmpty = async (url: string, body?: unknown): Promise<Result<void>> => {
  const res = await authedFetch<{ code?: string }>(url, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    return {
      ok: false,
      message: res.message ?? "Request failed",
      code: (res.data as { code?: string } | undefined)?.code,
      status: res.status,
    };
  }

  return { ok: true, data: undefined };
};

/**
 * What the PIN endpoints put in `code`. The UI branches on these rather than on the
 * message, which is written for the collector and will be reworded.
 */
export type PinErrorCode =
  /** No PIN yet — offer to set one instead of asking for something never chosen. */
  | "PIN_NOT_SET"
  | "PIN_REQUIRED"
  | "PIN_INCORRECT"
  /** 429. The wait is already in the message; the UI does not compute it. */
  | "PIN_LOCKED"
  | "CURRENT_PIN_REQUIRED"
  | "PIN_INVALID"
  | "PIN_TOO_COMMON"
  | "PIN_UNCHANGED"
  | "NO_RESET_CODE"
  | "RESET_CODE_INCORRECT"
  | "RESET_CODE_EXPIRED"
  | "RESET_CODE_SPENT";

/** Whether one is set, so the UI knows to prompt or to offer setup. */
export const getPaymentPinStatus = () =>
  request<{ isSet: boolean }>(API_ENDPOINTS.COLLECTOR.PIN_STATUS);

/** Sets the PIN. `currentPin` is required only when one already exists. */
export const setPaymentPin = (input: { pin: string; currentPin?: string }) =>
  requestEmpty(API_ENDPOINTS.COLLECTOR.PIN, input);

/**
 * Checks the PIN before the wallet is asked to sign.
 *
 * Shares the lockout counter with the submit check, so it buys no extra guesses. It
 * exists so a wrong PIN costs a typo rather than a signing prompt the collector
 * approved for nothing.
 */
export const verifyPaymentPin = (pin: string) =>
  requestEmpty(API_ENDPOINTS.COLLECTOR.PIN_VERIFY, { pin });

/** Emails a code for setting a new PIN. Reachable while locked out — that is the point. */
export const requestPinReset = () => requestEmpty(API_ENDPOINTS.COLLECTOR.PIN_RESET);

export const resetPaymentPin = (input: { otp: string; pin: string }) =>
  requestEmpty(API_ENDPOINTS.COLLECTOR.PIN_RESET_CONFIRM, input);
