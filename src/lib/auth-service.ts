import { API_ENDPOINTS } from "./api";
import { clearStoredSocketFiSession } from "./socketfi-session";

// ─── Token storage helpers ───
const ACCESS_TOKEN_KEY = "neft_access_token";
const REFRESH_TOKEN_KEY = "neft_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(
  accessToken: string,
  refreshToken?: string,
  opts?: { notify?: boolean },
) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (opts?.notify !== false) {
    // Notify UserProvider that auth state changed (same-tab)
    window.dispatchEvent(new Event("neft-auth-change"));
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearStoredSocketFiSession();
  // Notify UserProvider that auth state changed (same-tab)
  window.dispatchEvent(new Event("neft-auth-change"));
}

// ─── Generic fetch wrapper (exported for use by other services) ───
export type ApiResponse<T = unknown> = { ok: boolean; status: number; data: T; message?: string };

function extractApiErrorMessage(data: Record<string, unknown>, fallback: string): string {
  const fieldErrors = data.errors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const first = Object.values(fieldErrors as Record<string, unknown>)
      .flat()
      .find((entry) => typeof entry === "string");
    if (typeof first === "string") return first;
  }

  if (typeof data.message === "string" && data.message !== "Request body is invalid") {
    return data.message;
  }

  return typeof data.error === "string" ? data.error : fallback;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        message: extractApiErrorMessage(
          data as Record<string, unknown>,
          `Request failed (${res.status})`,
        ),
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, status: 0, data: {} as T, message };
  }
}

/** Single-flight refresh so parallel 401s share one refresh request. */
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Exchange the refresh token for a new access (+ rotated refresh) token.
 * Returns true when the session was successfully extended.
 */
export async function ensureFreshAccessToken(): Promise<boolean> {
  if (!getRefreshToken()) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const result = await refreshAccessToken({ notify: false });
      if (!result.ok) {
        clearTokens();
        return false;
      }
      return true;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

/** Convenience wrapper: Bearer token + automatic refresh retry on expiry. */
export async function authedFetch<T = unknown>(
  url: string,
  options: Omit<RequestInit, "headers"> & { headers?: Record<string, string> } = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  if (!token) {
    // Access gone but refresh may still be valid (e.g. after idle tab)
    const refreshed = await ensureFreshAccessToken();
    if (!refreshed) {
      return { ok: false, status: 401, data: {} as T, message: "Not authenticated" };
    }
  }

  const run = (accessToken: string) =>
    apiFetch<T>(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    });

  const active = getAccessToken();
  if (!active) {
    return { ok: false, status: 401, data: {} as T, message: "Not authenticated" };
  }

  const first = await run(active);
  if (first.ok || (first.status !== 401 && first.status !== 403)) {
    return first;
  }

  const refreshed = await ensureFreshAccessToken();
  if (!refreshed) {
    return first;
  }

  const next = getAccessToken();
  if (!next) {
    return { ok: false, status: 401, data: {} as T, message: "Not authenticated" };
  }

  return run(next);
}

// ─── Auth API functions ───

export async function register(payload: { fullName: string; email: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.REGISTER, { method: "POST", body: JSON.stringify(payload) });
}

export async function verifyEmail(payload: { token: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { method: "POST", body: JSON.stringify(payload) });
}

export async function requestLoginOtp(payload: { email: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.LOGIN_OTP_REQUEST, { method: "POST", body: JSON.stringify(payload) });
}

export async function verifyLoginOtp(payload: { email: string; otp: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.LOGIN_OTP_VERIFY, { method: "POST", body: JSON.stringify(payload) });
}

export async function refreshAccessToken(opts?: { notify?: boolean }) {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return { ok: false, status: 0, data: {}, message: "No refresh token" };
  }

  const result = await apiFetch<Record<string, unknown>>(
    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    { method: "POST", body: JSON.stringify({ refreshToken }) }
  );

  if (result.ok) {
    const nested = (result.data?.data || result.data) as {
      accessToken?: string;
      refreshToken?: string;
    };
    if (nested?.accessToken) {
      setTokens(nested.accessToken, nested.refreshToken, {
        notify: opts?.notify ?? false,
      });
    } else {
      return { ok: false, status: result.status, data: result.data, message: "Missing access token" };
    }
  }

  return result;
}

export function initiateGoogleOAuth() {
  // Pass current origin so backend redirects tokens to the correct port
  const redirectUrl = encodeURIComponent(window.location.origin);
  window.location.href = `${API_ENDPOINTS.AUTH.GOOGLE_OAUTH}?redirect=${redirectUrl}&callbackUrl=${redirectUrl}&redirect_uri=${redirectUrl}`;
}

// ─── Profile & User ───

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

export async function getProfile() {
  return authedFetch<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
    method: "GET",
  });
}

export async function getMe() {
  return authedFetch(API_ENDPOINTS.AUTH.ME, {
    method: "GET",
  });
}

export async function updateProfile(
  payload: Partial<Pick<UserProfile, "fullName" | "bio" | "profilePicture">>,
) {
  return authedFetch<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ─── Account Management ───

export async function changePassword(payload: any) {
  return authedFetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: { email: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: any) {
  return apiFetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  const token = getAccessToken();
  if (token) {
    await apiFetch(API_ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  clearTokens();
}

export async function logoutAll() {
  const token = getAccessToken();
  if (token) {
    await apiFetch(API_ENDPOINTS.AUTH.LOGOUT_ALL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  clearTokens();
}

export async function deactivateAccount() {
  return authedFetch(API_ENDPOINTS.AUTH.DEACTIVATE, {
    method: "PUT",
    body: JSON.stringify({ confirmation: "DEACTIVATE" }),
  });
}

export async function deleteAccount() {
  return authedFetch(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
    method: "DELETE",
    body: JSON.stringify({ confirmation: "DELETE" }),
  });
}
