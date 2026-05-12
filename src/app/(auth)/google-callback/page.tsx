"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/auth-service";
import { Suspense } from "react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    // The backend redirects here with tokens in the URL query params
    const accessToken = searchParams.get("accessToken") || searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (accessToken) {
      setTokens(accessToken, refreshToken || undefined);
      router.push("/home");
    } else {
      setError("No authentication token received. Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    }
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
            <p className="text-sm text-slate-600">Completing sign in...</p>
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
