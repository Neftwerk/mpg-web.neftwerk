export type CoinflowCheckoutEvent =
  | { type: "success"; paymentId?: string; saleId?: string; kind?: string }
  | { type: "heightChange"; heightPx: number }
  | { type: "cancel" };

function isCoinflowOrigin(origin: string): boolean {
  return origin.includes("coinflow.cash");
}


export function parseCoinflowHeightPx(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const pxMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*px$/i);
  if (pxMatch) return Math.max(320, Math.round(Number(pxMatch[1])));

  const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) return Math.max(320, Math.round(Number(numMatch[1])));

  return null;
}

export function parseCoinflowCheckoutMessage(
  data: unknown,
  origin: string,
): CoinflowCheckoutEvent | null {
  if (typeof data !== "string") return null;

  const trusted =
    isCoinflowOrigin(origin) ||
    (typeof window !== "undefined" && origin === window.location.origin);
  if (!trusted) return null;

  try {
    const message = JSON.parse(data) as Record<string, unknown>;

    if (message.data === "success") {
      const info = message.info as { paymentId?: string } | undefined;
      return {
        type: "success",
        paymentId: info?.paymentId,
        saleId: typeof message.saleId === "string" ? message.saleId : undefined,
        kind: typeof message.kind === "string" ? message.kind : undefined,
      };
    }

    if (message.data === "cancel") {
      return { type: "cancel" };
    }

    if (message.method === "heightChange") {
      const heightPx = parseCoinflowHeightPx(message.data);
      if (heightPx) return { type: "heightChange", heightPx };
    }
  } catch {
    return null;
  }

  return null;
}

export function withCoinflowHeightParam(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("useHeightChange", "true");
  return parsed.toString();
}
