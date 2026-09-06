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

export interface FiatDepositAccount {
  id: string;
  wallet_id: string;
  provider: string;
  environment: string;
  status: string;
  source: { currency: string; payment_rails?: string[] };
  destination: { asset: string; chain: string };
  /** Bridge's own field names, passed through verbatim — render generically. */
  deposit_instructions?: Record<string, unknown>;
  created_at: string;
}

export interface Deposit {
  _id: string;
  amount: string;
  assetCode: string;
  transactionHash: string;
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
  request<FiatDepositAccount>(API_ENDPOINTS.COLLECTOR.CREATE_DEPOSIT_ACCOUNT, {
    method: "POST",
  });

/** Resolves with `null` when the collector has no deposit account yet. */
export const getDepositAccount = () =>
  request<FiatDepositAccount | null>(API_ENDPOINTS.COLLECTOR.DEPOSIT_ACCOUNT);

export const listDeposits = () => request<Deposit[]>(API_ENDPOINTS.COLLECTOR.DEPOSITS);

export const getDepositQuote = (priceUsd: number) =>
  request<DepositQuote>(API_ENDPOINTS.COLLECTOR.DEPOSIT_QUOTE(priceUsd));
