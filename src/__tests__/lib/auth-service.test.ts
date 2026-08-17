import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  apiFetch,
  authedFetch,
  register,
  requestLoginOtp,
  verifyLoginOtp,
  logout,
} from "@/lib/auth-service";

// ── Helper to mock fetch responses ──
function mockFetchResponse(body: unknown, status = 200, ok = true) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe("Token storage helpers", () => {
  it("getAccessToken returns null when no token is stored", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("getRefreshToken returns null when no token is stored", () => {
    expect(getRefreshToken()).toBeNull();
  });

  it("setTokens stores access token and retrieves it", () => {
    setTokens("test-access-token", undefined, { notify: false });
    expect(getAccessToken()).toBe("test-access-token");
  });

  it("setTokens stores both access and refresh tokens", () => {
    setTokens("access-123", "refresh-456", { notify: false });
    expect(getAccessToken()).toBe("access-123");
    expect(getRefreshToken()).toBe("refresh-456");
  });

  it("setTokens dispatches neft-auth-change by default", () => {
    setTokens("tok");
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "neft-auth-change" })
    );
  });

  it("setTokens skips dispatch when notify is false", () => {
    const spy = window.dispatchEvent as ReturnType<typeof vi.fn>;
    spy.mockClear();
    setTokens("tok", undefined, { notify: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it("clearTokens removes both tokens", () => {
    setTokens("access", "refresh", { notify: false });
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("clearTokens dispatches auth-change event", () => {
    setTokens("tok", undefined, { notify: false });
    (window.dispatchEvent as ReturnType<typeof vi.fn>).mockClear();
    clearTokens();
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "neft-auth-change" })
    );
  });
});

describe("apiFetch", () => {
  it("returns ok:true with data for 200 response", async () => {
    mockFetchResponse({ message: "success" });

    const result = await apiFetch("https://api.test.com/test");

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ message: "success" });
  });

  it("returns ok:false with error message for non-ok response", async () => {
    mockFetchResponse({ message: "Not found" }, 404, false);

    const result = await apiFetch("https://api.test.com/test");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
    expect(result.message).toBe("Not found");
  });

  it("extracts field-level validation errors", async () => {
    mockFetchResponse(
      {
        message: "Request body is invalid",
        errors: { email: ["Email is required"] },
      },
      422,
      false
    );

    const result = await apiFetch("https://api.test.com/test");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("Email is required");
  });

  it("falls back to error field when message is generic", async () => {
    mockFetchResponse(
      {
        message: "Request body is invalid",
        error: "Validation failed",
      },
      400,
      false
    );

    const result = await apiFetch("https://api.test.com/test");

    expect(result.message).toBe("Validation failed");
  });

  it("handles network errors gracefully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network offline")
    );

    const result = await apiFetch("https://api.test.com/test");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(result.message).toBe("Network offline");
  });

  it("handles non-Error thrown values", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce("string error");

    const result = await apiFetch("https://api.test.com/test");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("Network error");
  });

  it("sets Content-Type and credentials by default", async () => {
    mockFetchResponse({});

    await apiFetch("https://api.test.com/test");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test.com/test",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("handles response with unparseable JSON", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    const result = await apiFetch("https://api.test.com/test");

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({});
  });
});

describe("authedFetch", () => {
  it("returns 401 when no token is available and refresh fails", async () => {
    // No token in localStorage, refresh will fail
    mockFetchResponse({}, 401, false);

    const result = await authedFetch("https://api.test.com/test");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.message).toBe("Not authenticated");
  });

  it("sends Authorization header with stored token", async () => {
    setTokens("my-access-token", undefined, { notify: false });
    mockFetchResponse({ data: "ok" });

    await authedFetch("https://api.test.com/protected");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test.com/protected",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-access-token",
        }),
      })
    );
  });

  it("returns data on successful authed request", async () => {
    setTokens("tok", undefined, { notify: false });
    mockFetchResponse({ items: [1, 2, 3] });

    const result = await authedFetch("https://api.test.com/data");

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ items: [1, 2, 3] });
  });
});

describe("Auth API functions", () => {
  describe("register", () => {
    it("sends POST with fullName and email", async () => {
      mockFetchResponse({ data: { id: "user1" } });

      const result = await register({ fullName: "Test User", email: "test@test.com" });

      expect(result.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/register"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ fullName: "Test User", email: "test@test.com" }),
        })
      );
    });

    it("returns error on failed registration", async () => {
      mockFetchResponse({ message: "Email already registered" }, 409, false);

      const result = await register({ fullName: "Test", email: "existing@test.com" });

      expect(result.ok).toBe(false);
      expect(result.message).toBe("Email already registered");
    });
  });

  describe("requestLoginOtp", () => {
    it("sends POST with email", async () => {
      mockFetchResponse({ message: "OTP sent" });

      const result = await requestLoginOtp({ email: "user@test.com" });

      expect(result.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login/otp"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@test.com" }),
        })
      );
    });
  });

  describe("verifyLoginOtp", () => {
    it("sends POST with email and otp", async () => {
      mockFetchResponse({ data: { accessToken: "tok123" } });

      const result = await verifyLoginOtp({ email: "user@test.com", otp: "123456" });

      expect(result.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login/otp/verify"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@test.com", otp: "123456" }),
        })
      );
    });

    it("returns error for invalid OTP", async () => {
      mockFetchResponse({ message: "Invalid or expired OTP" }, 401, false);

      const result = await verifyLoginOtp({ email: "user@test.com", otp: "000000" });

      expect(result.ok).toBe(false);
      expect(result.message).toBe("Invalid or expired OTP");
    });
  });

  describe("logout", () => {
    it("clears tokens after sending logout request", async () => {
      setTokens("access", "refresh", { notify: false });
      mockFetchResponse({});

      await logout();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it("clears tokens even when no token was stored", async () => {
      await logout();
      expect(getAccessToken()).toBeNull();
    });
  });
});
