import { API_ENDPOINTS } from "./api";

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
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ─── Generic fetch wrapper ───
async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T; message?: string }> {
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
        message: data?.message || data?.error || `Request failed (${res.status})`,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, status: 0, data: {} as T, message };
  }
}

// ─── Auth API functions ───

/**
 * POST /api/auth/register
 * Register a new customer
 */
export async function register(payload: {
  fullName: string;
  email: string;
}) {
  return apiFetch(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/auth/verify-email
 * Verify email with OTP token sent after registration
 */
export async function verifyEmail(payload: { token: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/auth/login/otp
 * Request OTP for login (email-based, customers only)
 */
export async function requestLoginOtp(payload: { email: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.LOGIN_OTP_REQUEST, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/auth/login/otp/verify
 * Verify OTP and authenticate customer — returns tokens
 */
export async function verifyLoginOtp(payload: { email: string; otp: string }) {
  return apiFetch(API_ENDPOINTS.AUTH.LOGIN_OTP_VERIFY, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/auth/refresh
 * Refresh access token using stored refresh token
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return { ok: false, status: 0, data: {}, message: "No refresh token" };
  }

  const result = await apiFetch<Record<string, unknown>>(
    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }
  );

  if (result.ok) {
    const nested = (result.data?.data || result.data) as { accessToken?: string; refreshToken?: string };
    if (nested?.accessToken) {
      setTokens(nested.accessToken, nested.refreshToken);
    }
  }

  return result;
}

/**
 * Google OAuth — redirect the browser to the backend Google endpoint.
 * The backend will handle the OAuth flow and redirect back.
 */
export function initiateGoogleOAuth() {
  window.location.href = API_ENDPOINTS.AUTH.GOOGLE_OAUTH;
}

// ─── Profile ───

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  // The API may return additional fields
  [key: string]: unknown;
}

/**
 * GET /api/auth/profile
 * Fetch the authenticated user's profile
 */
export async function getProfile() {
  const token = getAccessToken();
  if (!token) {
    return { ok: false, status: 401, data: {} as UserProfile, message: "Not authenticated" };
  }

  return apiFetch<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile
 */
export async function updateProfile(payload: Partial<Pick<UserProfile, "fullName" | "bio" | "avatarUrl">>) {
  const token = getAccessToken();
  if (!token) {
    return { ok: false, status: 401, data: {} as UserProfile, message: "Not authenticated" };
  }

  return apiFetch<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
