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

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  // Notify UserProvider that auth state changed (same-tab)
  window.dispatchEvent(new Event("neft-auth-change"));
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

/** Convenience wrapper: apiFetch with Bearer token auto-attached */
export async function authedFetch<T = unknown>(
  url: string,
  options: Omit<RequestInit, "headers"> & { headers?: Record<string, string> } = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  if (!token) {
    return { ok: false, status: 401, data: {} as T, message: "Not authenticated" };
  }
  return apiFetch<T>(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
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

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return { ok: false, status: 0, data: {}, message: "No refresh token" };
  }

  const result = await apiFetch<Record<string, unknown>>(
    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    { method: "POST", body: JSON.stringify({ refreshToken }) }
  );

  if (result.ok) {
    const nested = (result.data?.data || result.data) as { accessToken?: string; refreshToken?: string };
    if (nested?.accessToken) {
      setTokens(nested.accessToken, nested.refreshToken);
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
  const token = getAccessToken();
  if (!token) {
    return { ok: false, status: 401, data: {} as UserProfile, message: "Not authenticated" };
  }

  return apiFetch<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMe() {
  const token = getAccessToken();
  if (!token) return { ok: false, status: 401, data: null, message: "Not authenticated" };

  return apiFetch(API_ENDPOINTS.AUTH.ME, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateProfile(
  payload: Partial<Pick<UserProfile, "fullName" | "bio" | "profilePicture">>,
) {
  const token = getAccessToken();
  if (!token) {
    return { ok: false, status: 401, data: {} as UserProfile, message: "Not authenticated" };
  }

  return apiFetch<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

// ─── Account Management ───

export async function changePassword(payload: any) {
  const token = getAccessToken();
  if (!token) return { ok: false, status: 401, data: null, message: "Not authenticated" };

  return apiFetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
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
  const token = getAccessToken();
  if (!token) return { ok: false, status: 401, data: null, message: "Not authenticated" };

  return apiFetch(API_ENDPOINTS.AUTH.DEACTIVATE, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ confirmation: "DEACTIVATE" }),
  });
}

export async function deleteAccount() {
  const token = getAccessToken();
  if (!token) return { ok: false, status: 401, data: null, message: "Not authenticated" };

  return apiFetch(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ confirmation: "DELETE" }),
  });
}
