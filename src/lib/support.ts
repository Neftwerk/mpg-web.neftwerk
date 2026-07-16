import { API_ENDPOINTS } from "./api";
import { apiFetch } from "./auth-service";

/** Client-safe app version included with support form submissions. */
export const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "0.1.0";

export type SupportContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  appVersion?: string;
};

export async function submitSupportContact(payload: SupportContactPayload) {
  return apiFetch(API_ENDPOINTS.SUPPORT.CONTACT, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      appVersion: payload.appVersion ?? APP_VERSION,
    }),
  });
}
