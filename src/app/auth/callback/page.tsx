"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/auth-service";
import { API_ENDPOINTS } from "@/lib/api";
import { Suspense } from "react";

/**
 * /auth/callback — The route Google redirects to after authentication.
 *
 * The backend's Google OAuth redirect_uri is set to:
 *   https://mypocketgallery.com/auth/callback
 *
 * Flow:
 *   1. User clicks "Continue with Google"
 *   2. Backend redirects to Google with redirect_uri=.../auth/callback
 *   3. Google authenticates the user
 *   4. Google redirects HERE with ?code=...
 *   5. This page extracts the code and sends it to the backend:
 *      GET /api/auth/google/callback?code=...
 *   6. Backend validates the code with Google and returns JSON
 *   7. We store tokens/user data and redirect to /home
 */

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    async function handleCallback() {
      // Check for error from Google
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      // Extract the authorization code Google attached
      const code = searchParams.get("code");
      if (!code) {
        setError("No authorization code received from Google. Redirecting...");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      setStatus("Validating with server...");

      try {
        // Forward the code to the backend for validation
        // Backend endpoint: /api/auth/google/callback?code=...
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

        // Backend returns JSON on success. Handle multiple response shapes:
        //   { accessToken, refreshToken, user }
        //   { data: { accessToken, refreshToken, user } }
        //   { success: true, data: { ... } }
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
          // Backend returned 200 but no token field —
          // the entire response might BE the user object (session-based auth)
          if (data?.success !== false) {
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
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-white">
      <div className="text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-none border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600 max-w-sm">
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-900" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
