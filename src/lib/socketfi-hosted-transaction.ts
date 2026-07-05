import {
  getSocketFiApiUrl,
  getSocketFiClientId,
  getSocketFiNetwork,
} from "./socketfi-config";

const SOCKETFI_AUTH_URL = "https://auth.socket.fi";

type HostedTransactionMode = "sign" | "sign_and_submit";

export type OpenSocketFiHostedTransactionInput = {
  accessToken: string;
  contractId: string;
  callFunction: { name: string };
  argsXdr?: string[];
  authArgsXdr?: string[];
  txDetails?: Record<string, unknown>;
  display?: Record<string, unknown>;
  clientPaymaster?: string;
  mode?: HostedTransactionMode;
};

function getCenteredPopupFeatures(preferredWidth = 520, preferredHeight = 820) {
  const availWidth = window.screen.availWidth || window.innerWidth || preferredWidth;
  const availHeight = window.screen.availHeight || window.innerHeight || preferredHeight;
  const width = Math.max(320, Math.min(preferredWidth, availWidth - 24));
  const height = Math.max(480, Math.min(preferredHeight, availHeight - 48));
  const left = Math.max((availWidth - width) / 2, 0);
  const top = Math.max((availHeight - height) / 2, 0);
  return [
    `width=${Math.round(width)}`,
    `height=${Math.round(height)}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
    "menubar=no",
    "toolbar=no",
    "location=no",
    "status=no",
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
}

function safeClosePopup(popup: Window | null) {
  try {
    if (popup && !popup.closed) popup.close();
  } catch {
    // ignore cross-origin close errors
  }
}

/**
 * Opens the hosted SocketFi transaction popup using the v1-compatible intent
 * payload (txDetails + display). Required for ARTS-1 mints where the smart
 * wallet must authorize factory calls.
 */
export async function openSocketFiHostedTransaction(
  input: OpenSocketFiHostedTransactionInput,
): Promise<unknown> {
  if (typeof window === "undefined") {
    throw new Error("SocketFi transactions require a browser environment.");
  }

  const mode = input.mode ?? "sign_and_submit";
  const apiUrl = getSocketFiApiUrl();
  const intentRes = await fetch(`${apiUrl}/api/transaction-intents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      clientId: getSocketFiClientId(),
      clientPaymaster: input.clientPaymaster,
      network: getSocketFiNetwork(),
      origin: window.location.origin,
      contractId: input.contractId,
      callFunction: input.callFunction,
      argsXdr: input.argsXdr ?? [],
      authArgsXdr: input.authArgsXdr ?? [],
      txDetails: input.txDetails ?? {},
      display: {
        ...(input.display ?? {}),
        app: "My Pocket Gallery",
        appOrigin: window.location.origin,
      },
      feePreference: null,
      mode,
    }),
    credentials: "omit",
  });

  const intentBody = (await intentRes.json().catch(() => null)) as
    | { txSession?: string; txAccess?: string; message?: string; error?: string }
    | null;

  if (!intentRes.ok || !intentBody?.txSession) {
    throw new Error(
      intentBody?.message ??
        intentBody?.error ??
        "SocketFi could not prepare this transaction.",
    );
  }

  const txSession = intentBody.txSession;
  const txAccess = intentBody.txAccess;
  const transactionUrl = txAccess
    ? `${SOCKETFI_AUTH_URL}/api/transaction?clientId=${encodeURIComponent(
        getSocketFiClientId(),
      )}&txSession=${encodeURIComponent(txSession)}&txAccess=${encodeURIComponent(txAccess)}`
    : `${SOCKETFI_AUTH_URL}/api/transaction?clientId=${encodeURIComponent(
        getSocketFiClientId(),
      )}&txSession=${encodeURIComponent(txSession)}&mode=${encodeURIComponent(mode)}`;

  const popup = window.open(
    transactionUrl,
    `socketfi_transaction_${Date.now()}`,
    getCenteredPopupFeatures(),
  );

  if (!popup) {
    throw new Error(
      "The wallet popup was blocked. Please allow popups for this site and try Claim again.",
    );
  }

  return await new Promise((resolve, reject) => {
    const authOrigin = new URL(SOCKETFI_AUTH_URL).origin;

    const cleanup = () => {
      window.clearTimeout(timeout);
      window.clearInterval(popupCheck);
      window.removeEventListener("message", handleMessage);
    };

    const fail = (error: Error) => {
      cleanup();
      safeClosePopup(popup);
      reject(error);
    };

    const timeout = window.setTimeout(() => {
      fail(new Error("SocketFi transaction approval timed out."));
    }, 5 * 60 * 1000);

    const popupCheck = window.setInterval(() => {
      if (popup.closed) {
        fail(new Error("SocketFi transaction popup was closed."));
      }
    }, 1500);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== authOrigin) return;
      const data = event.data as Record<string, unknown> | null;
      if (!data || data.txSession !== txSession) return;

      if (
        data.type === "SOCKETFI_TRANSACTION_SUCCESS" ||
        data.type === "SOCKETFI_TRANSACTION_SIGNED"
      ) {
        cleanup();
        safeClosePopup(popup);
        resolve(data.data ?? data);
        return;
      }

      if (data.type === "SOCKETFI_TRANSACTION_ERROR") {
        fail(
          new Error(
            typeof data.message === "string"
              ? data.message
              : "SocketFi transaction failed.",
          ),
        );
        return;
      }

      if (data.type === "SOCKETFI_TRANSACTION_CANCELLED") {
        fail(new Error("SocketFi transaction was cancelled."));
      }
    };

    window.addEventListener("message", handleMessage);
  });
}
