"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/auth-service";
import { API_ENDPOINTS } from "@/lib/api";
import { Suspense } from "react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    async function handleCallback() {
      // Check for error from Google or backend
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setError(errorParam);
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      // ── Scenario 1: We received a `code` from Google ──
      // The frontend needs to forward this code to the backend for validation.
      const code = searchParams.get("code");
      if (code) {
        setStatus("Validating with server...");
        try {
          // Forward the full query string to the backend callback endpoint
          // This matches the flow: frontend extracts code → sends to backend
          const callbackUrl = `${API_ENDPOINTS.AUTH.GOOGLE_CALLBACK}?code=${encodeURIComponent(code)}`;
          const res = await fetch(callbackUrl, {
            method: "GET",
            headers: { "Accept": "application/json" },
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            setError(data?.message || data?.error || `Authentication failed (${res.status})`);
            setTimeout(() => router.push("/login"), 3000);
            return;
          }

          // The backend returns a JSON with user data on success.
          // Extract tokens — handle nested response shapes:
          //   { accessToken, refreshToken, user }
          //   { data: { accessToken, refreshToken, user } }
          //   { success: true, data: { accessToken, refreshToken, user } }
          const payload = data?.data || data;
          const accessToken = payload?.accessToken || payload?.token || payload?.access_token;
          const refreshToken = payload?.refreshToken || payload?.refresh_token;

          if (accessToken) {
            setTokens(accessToken, refreshToken || undefined);
            // Store user data if present
            const user = payload?.user || payload?.profile;
            if (user) {
              localStorage.setItem("neft_user", JSON.stringify(user));
            }
            setStatus("Success! Redirecting...");
            router.push("/home");
          } else {
            // The backend returned success JSON but no token — 
            // maybe the response IS the user object and tokens are handled differently.
            // Store the whole response as user data and check for session-based auth.
            if (data?.success || res.ok) {
              const userData = data?.data || data;
              localStorage.setItem("neft_user", JSON.stringify(userData));
              setStatus("Success! Redirecting...");
              router.push("/home");
            } else {
              setError("No authentication token received from server.");
              setTimeout(() => router.push("/login"), 3000);
            }
          }
        } catch (err) {
          console.error("Google callback error:", err);
          setError("Network error while completing sign in. Please try again.");
          setTimeout(() => router.push("/login"), 3000);
        }
        return;
      }

      // ── Scenario 2: Backend redirected with tokens in URL params directly ──
      const accessToken = searchParams.get("accessToken") || searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");

      if (accessToken) {
        setTokens(accessToken, refreshToken || undefined);
        // Check for user data in params
        const userData = searchParams.get("user");
        if (userData) {
          try {
            localStorage.setItem("neft_user", userData);
          } catch { /* ignore parse errors */ }
        }
        router.push("/home");
        return;
      }

      // ── No code, no tokens — nothing to process ──
      setError("No authentication data received. Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-none border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
              {error}
            </div>
            <p className="text-sm text-slate-500">Redirecting to login...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-900" />
            <p className="text-sm text-slate-600">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-900" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
