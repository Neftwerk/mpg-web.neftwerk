import { API_ENDPOINTS } from "./api";
import { authedFetch, getAccessToken } from "./auth-service";

interface CheckoutLinkData {
  checkoutLink?: string;
  link?: string;
}

interface SessionData {
  sessionKey?: string;
}

interface SaleCheckoutData {
  saleId: string;
  artworkId: string;
  amountCents: number;
  paymentMethod: "card" | "bank";
  externalId: string;
  status: "pending" | "paid" | "failed" | "refunded";
}

export async function startArtworkCheckout(opts: {
  artworkId: string;
  listPriceCents: number;
  returnPath?: string;
  onStatus?: (status: string) => void;
}): Promise<{
  ok: boolean;
  message?: string;
  cancelled?: boolean;
  checkoutLink?: string;
  saleId?: string;
}> {
  if (typeof window === "undefined") {
    return { ok: false, message: "Checkout is only available in the browser" };
  }

  if (!opts.listPriceCents || opts.listPriceCents <= 0) {
    return { ok: false, message: "This artwork is not available for purchase yet." };
  }

  const returnPath = opts.returnPath ?? `/artwork/${opts.artworkId}`;

  const token = getAccessToken();
  if (!token) {
    window.location.href = `/login?redirect=${encodeURIComponent(returnPath)}`;
    return { ok: false, message: "Sign in to continue checkout." };
  }

  opts.onStatus?.("Starting checkout…");
  const saleRes = await authedFetch<{ data?: SaleCheckoutData }>(
    API_ENDPOINTS.SALES.CHECKOUT,
    {
      method: "POST",
      body: JSON.stringify({
        artworkId: opts.artworkId,
        paymentMethod: "card", // card/bank via Coinflow hosted checkout
      }),
    },
  );

  if (!saleRes.ok) {
    return {
      ok: false,
      message: saleRes.message ?? "Could not start checkout.",
    };
  }

  const sale = saleRes.data?.data;
  if (!sale) {
    return { ok: false, message: "Sale information is unavailable." };
  }

  if (!sale.amountCents || sale.amountCents <= 0) {
    return {
      ok: false,
      message: "This artwork has no valid checkout price. Please refresh and try again.",
    };
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[checkout] sale amountCents:", sale.amountCents);
  }

  opts.onStatus?.("Starting checkout…");
  const sessionRes = await authedFetch<{ data?: SessionData }>(
    API_ENDPOINTS.PAYMENTS.SESSION,
    {
      method: "POST",
      body: JSON.stringify({ blockchain: "stellar" }),
    },
  );

  if (!sessionRes.ok) {
    return {
      ok: false,
      message: sessionRes.message ?? "Could not start checkout session.",
    };
  }

  const sessionKey = sessionRes.data?.data?.sessionKey;
  if (!sessionKey) {
    return { ok: false, message: "Checkout session key missing." };
  }

  const origin = window.location.origin;
  const linkRes = await authedFetch<{ data?: CheckoutLinkData }>(
    API_ENDPOINTS.PAYMENTS.CHECKOUT_LINK,
    {
      method: "POST",
      headers: { "x-coinflow-session-key": sessionKey },
      body: JSON.stringify({
        subtotalCents: sale.amountCents,
        blockchain: "stellar",
        externalId: sale.externalId,
        successUrl: `${origin}/checkout-success?kind=artwork&saleId=${encodeURIComponent(
          sale.saleId,
        )}`,
        cancelUrl: `${origin}/checkout-cancel`,
      }),
    },
  );

  if (!linkRes.ok) {
    return {
      ok: false,
      message: linkRes.message ?? "Could not create checkout link.",
    };
  }

  const checkoutLink =
    linkRes.data?.data?.checkoutLink ?? linkRes.data?.data?.link;
  if (!checkoutLink) {
    return { ok: false, message: "Checkout link unavailable." };
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const parsed = new URL(checkoutLink);
      const cents = parsed.searchParams.get("cents");
      console.debug("[checkout] Coinflow link cents param:", cents ?? "(missing)");
    } catch {
      console.debug("[checkout] Coinflow link:", checkoutLink);
    }
  }

  return { ok: true, checkoutLink, saleId: sale.saleId };
}
