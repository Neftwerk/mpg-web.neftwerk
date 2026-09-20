import { API_ENDPOINTS } from "./api";
import { authedFetch } from "./auth-service";

/**
 * Paying for an artwork from the collector's own Stellar wallet.
 *
 * The server composes the transaction but cannot pay: every operation is sourced
 * from the collector's account, and the submit endpoint verifies the signature
 * against the address it holds on record before it will send anything.
 */

/** A payee's share, as the backend recorded it when composing the transaction. */
export interface PaymentSplit {
  /** `gallery` or `artist`. */
  role: string;
  /** Always set — the vault's address when the payee has none of their own. */
  address: string;
  amountCents: number;
  /**
   * The payee had no address on record, so their share went to the Neftwerk vault.
   * An obligation rather than a payment, and worth saying out loud: the buyer's
   * money still leaves their wallet, it just does not reach that payee yet.
   */
  toVault: boolean;
}

export interface PurchaseEnvelope {
  saleId: string;
  /** Decode this before signing. Never sign on the summary alone. */
  xdr: string;
  /** 32-byte hex. What Privy actually signs. */
  hash: string;
  amountCents: number;
  /**
   * For labelling the decoded operations — who each payee is — never instead of
   * them. These are our claim about the transaction; the XDR is the transaction.
   */
  splits: PaymentSplit[];
}

export interface SaleCheckout {
  saleId: string;
  artworkId: string;
  amountCents: number;
  status: "pending" | "paid" | "failed" | "refunded";
}

export interface PaymentResult {
  saleId: string;
  txHash: string;
  status: string;
}

/** Carries `code` and `status` so a caller can tell refusals apart from failures. */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string; status?: number };

const request = async <T>(
  url: string,
  options: { method?: string; body?: unknown } = {},
): Promise<Result<T>> => {
  const res = await authedFetch<{ data?: T }>(url, {
    method: options.method ?? "GET",
    // `authedFetch` does not serialise, and double-encoding here sends the server a
    // JSON string where it expects an object.
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });

  if (!res.ok) {
    const body = res.data as { code?: string } | undefined;
    return {
      ok: false,
      message: res.message ?? "Request failed",
      code: body?.code,
      status: res.status,
    };
  }

  if (res.data?.data === undefined) {
    return { ok: false, message: "The server returned no data" };
  }

  return { ok: true, data: res.data.data };
};

/**
 * Creates the pending sale this payment will settle.
 *
 * `paymentMethod` is passed rather than assumed: the backend still accepts card
 * and bank, and hardcoding the wallet here would quietly close a door that is not
 * ours to close.
 */
export const startCheckout = (artworkId: string, paymentMethod = "wallet") =>
  request<SaleCheckout>(API_ENDPOINTS.SALES.CHECKOUT, {
    method: "POST",
    body: { artworkId, paymentMethod },
  });

/**
 * Composes the payment for a sale: one USDC operation per payee, atomic.
 *
 * The server persists the envelope and returns that same one while its sequence
 * number holds, so calling again is safe and resumes rather than duplicates.
 *
 * What is never safe is treating a failed submit as a reason to build a new one. A
 * rebuild takes a fresh sequence number, and a fresh sequence number is a second
 * payment — so a caller that retries must resubmit the envelope it already has.
 */
export const buildPayment = (saleId: string) =>
  request<PurchaseEnvelope>(API_ENDPOINTS.SALES.PAYMENT(saleId), { method: "POST" });

/**
 * Submits the signed envelope.
 *
 * Retrying is this same call with the same envelope and signature. The server
 * checks the envelope is byte-identical to the one it composed, and answers a
 * double submit with the recorded hash rather than paying twice.
 */
export const submitPayment = (
  saleId: string,
  input: { xdr: string; signature: string },
) =>
  request<PaymentResult>(API_ENDPOINTS.SALES.PAYMENT_SUBMIT(saleId), {
    method: "POST",
    body: input,
  });
