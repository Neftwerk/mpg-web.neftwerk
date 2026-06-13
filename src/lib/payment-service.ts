import { API_ENDPOINTS } from "./api";
import { authedFetch, getAccessToken } from "./auth-service";

interface CheckoutLinkData {
  checkoutLink?: string;
}

interface SessionData {
  sessionKey?: string;
}

export async function startArtworkCheckout(opts: {
  artworkId: string;
  listPriceCents: number;
  returnPath?: string;
}): Promise<{ ok: boolean; message?: string }> {
  if (typeof window === "undefined") {
    return { ok: false, message: "Checkout is only available in the browser" };
  }

  if (!opts.listPriceCents || opts.listPriceCents <= 0) {
    return { ok: false, message: "This artwork is not available for purchase yet." };
  }

  const token = getAccessToken();
  const returnPath = opts.returnPath ?? `/artwork/${opts.artworkId}`;

  if (!token) {
    window.location.href = `/login?redirect=${encodeURIComponent(returnPath)}`;
    return { ok: false, message: "Sign in to continue checkout." };
  }

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
        subtotalCents: opts.listPriceCents,
        blockchain: "stellar",
        externalId: `artwork:${opts.artworkId}`,
        successUrl: `${origin}/link-success?kind=artwork`,
        cancelUrl: `${origin}${returnPath}`,
      }),
    },
  );

  if (!linkRes.ok) {
    return {
      ok: false,
      message: linkRes.message ?? "Could not create checkout link.",
    };
  }

  const checkoutLink = linkRes.data?.data?.checkoutLink;
  if (!checkoutLink) {
    return { ok: false, message: "Checkout link unavailable." };
  }

  window.location.href = checkoutLink;
  return { ok: true };
}
