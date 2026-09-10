"use client";

import { useCallback } from "react";
import { useSignRawHash } from "@privy-io/react-auth/extended-chains";
import { TransactionBuilder, type Transaction } from "@stellar/stellar-sdk";

export interface DecodedPayment {
  destination: string;
  amount: string;
  assetCode: string;
}

/**
 * Decodes an envelope, refusing a fee-bump wrapper.
 *
 * The passphrase must be the backend's own (`GET /api/chain/config`), not one
 * derived from a client env var: the hash depends on it, so a mismatch yields a
 * signature the backend rejects with nothing to point at.
 */
export const decodeEnvelope = (xdr: string, networkPassphrase: string): Transaction => {
  const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase);
  if ("innerTransaction" in tx) {
    throw new Error("Expected a plain transaction, not a fee-bump wrapper");
  }
  return tx;
};

/**
 * The payees a transaction actually contains.
 *
 * Read from the decoded envelope and never from a sibling field in the response:
 * what is shown has to be derived from what will be signed, or the review is
 * theatre.
 */
export const decodePayments = (
  xdr: string,
  networkPassphrase: string,
): DecodedPayment[] =>
  decodeEnvelope(xdr, networkPassphrase).operations.flatMap((op) =>
    op.type === "payment"
      ? [
          {
            destination: op.destination,
            amount: op.amount,
            assetCode: "code" in op.asset ? op.asset.code : "XLM",
          },
        ]
      : [],
  );

export interface DecodedOperation {
  /** Plain-language description of what this operation does. */
  label: string;
  /** The address or asset it concerns, when there is one worth showing. */
  detail?: string;
}

/**
 * A plain-language summary of what an envelope does, for a review step.
 *
 * `decodePayments` only speaks about payments, and activation is not one — it
 * creates the account and its USDC trustline. Read from the decoded transaction for
 * the same reason: what is shown must be derived from what will be signed.
 */
export const describeEnvelope = (
  xdr: string,
  networkPassphrase: string,
): DecodedOperation[] =>
  decodeEnvelope(xdr, networkPassphrase).operations.map((op) => {
    switch (op.type) {
      case "createAccount":
        return { label: "Create your Stellar account", detail: op.destination };
      case "changeTrust":
        return {
          label: `Allow your account to hold ${
            "code" in op.line ? op.line.code : "the asset"
          }`,
        };
      case "beginSponsoringFutureReserves":
        return { label: "Neftwerk pays your account reserve", detail: op.sponsoredId };
      case "endSponsoringFutureReserves":
        return { label: "End Neftwerk's sponsorship" };
      case "payment":
        return {
          label: `Pay ${op.amount} ${"code" in op.asset ? op.asset.code : "XLM"}`,
          detail: op.destination,
        };
      default:
        return { label: op.type };
    }
  });

export interface SignEnvelopeInput {
  xdr: string;
  /** The collector's own `G…` — the wallet Privy signs with. */
  address: string;
  networkPassphrase: string;
  /**
   * The hash the server said this envelope has. Compared against the one computed
   * locally, so a tampered response cannot get a signature over something else.
   */
  expectedHash?: string;
}

/**
 * Raw-hash signing for Stellar, which Privy treats as an extended chain: there is
 * no XDR-aware signing path, so the collector's wallet signs 32 bytes and the
 * review UI is what gives those bytes meaning.
 */
export const useStellarSigner = () => {
  const { signRawHash } = useSignRawHash();

  const signEnvelope = useCallback(
    async (input: SignEnvelopeInput): Promise<string> => {
      const hash = decodeEnvelope(input.xdr, input.networkPassphrase)
        .hash()
        .toString("hex");

      if (input.expectedHash && input.expectedHash !== hash) {
        throw new Error("This transaction does not match what the server described");
      }

      const { signature } = await signRawHash({
        address: input.address,
        chainType: "stellar",
        hash: `0x${hash}`,
      });

      // Returned 0x-prefixed, which both submit endpoints accept.
      return signature;
    },
    [signRawHash],
  );

  return { signEnvelope };
};
