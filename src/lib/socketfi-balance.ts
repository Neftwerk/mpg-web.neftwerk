import { Address, scValToNative, xdr } from "@stellar/stellar-sdk";
import type { SocketFiSession } from "@socketfi/react";
import { getUsdTokenContractId } from "./socketfi-config";
import { getSocketFiClient } from "./socketfi";
import {
  getSocketFiWalletAddress,
  getSocketFiWalletAddressXdr,
} from "./socketfi-session";

const USD_DECIMALS = 7;

export type WalletBalanceResult =
  | { ok: true; balanceRaw: bigint; balanceLabel: string }
  | { ok: false; message: string; silent?: boolean };

function walletAddressToArgXdr(address: string): string {
  return Address.fromString(address).toScVal().toXDR("base64");
}

function parseBalanceValue(value: unknown): bigint | null {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(Math.trunc(value));

  if (typeof value === "string") {
    if (/^\d+$/.test(value)) return BigInt(value);

    try {
      const scVal = xdr.ScVal.fromXDR(value, "base64");
      const native = scValToNative(scVal);
      if (typeof native === "bigint") return native;
      if (typeof native === "number" && Number.isFinite(native)) return BigInt(Math.trunc(native));
      if (typeof native === "string" && /^\d+$/.test(native)) return BigInt(native);
    } catch {
      return null;
    }
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      parseBalanceValue(record.balance) ??
      parseBalanceValue(record.amount) ??
      parseBalanceValue(record.value) ??
      parseBalanceValue(record.result)
    );
  }

  return null;
}

export function formatUsdBalance(amount: bigint, decimals = USD_DECIMALS): string {
  const zero = BigInt(0);
  const hundred = BigInt(100);
  const negative = amount < zero;
  const absolute = negative ? -amount : amount;
  const divisor = BigInt(10) ** BigInt(decimals);
  const displayCents = (absolute * hundred) / divisor;
  const whole = displayCents / hundred;
  const cents = displayCents % hundred;

  return `${negative ? "-" : ""}$${whole.toLocaleString("en-US")}.${cents
    .toString()
    .padStart(2, "0")}`;
}

export async function fetchUsdTokenBalance(
  session: SocketFiSession,
): Promise<WalletBalanceResult> {
  const walletAddress = getSocketFiWalletAddress(session);
  const walletAddressXdr =
    getSocketFiWalletAddressXdr(session) ??
    (walletAddress ? walletAddressToArgXdr(walletAddress) : undefined);

  if (!walletAddressXdr) {
    console.warn("[SocketFi] wallet address unavailable from session", session);
    return {
      ok: false,
      message: "Wallet address unavailable from SocketFi session.",
      silent: true,
    };
  }

  try {
    const response = await getSocketFiClient().readContract({
      accessToken: session.accessToken,
      contractId: getUsdTokenContractId(),
      callFunction: { name: "balance" },
      argsXdr: [walletAddressXdr],
    });

    console.log("[SocketFi] balance response:", response);

    const balanceRaw =
      parseBalanceValue(response.result) ??
      parseBalanceValue(response.simulation) ??
      parseBalanceValue(response);

    if (balanceRaw === null) {
      return { ok: false, message: "Could not parse USD balance from contract response." };
    }

    return {
      ok: true,
      balanceRaw,
      balanceLabel: formatUsdBalance(balanceRaw),
    };
  } catch (error) {
    console.error("[SocketFi] balance read failed:", error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to read USD balance. Please try again.",
    };
  }
}
