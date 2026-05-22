"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/auth-service";
import { useUser } from "@/lib/UserContext";
import { Suspense } from "react";

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useUser();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken") || searchParams.get("token") || searchParams.get("access_token");
    const refreshToken = searchParams.get("refreshToken") || searchParams.get("refresh_token");

    if (accessToken) {
      console.log("[GoogleCallback] Tokens received, storing...");
      setTokens(accessToken, refreshToken || undefined);
      // Refresh the user context so the profile loads
      refresh().then(() => {
        router.replace("/home");
      });
    } else {
      console.log("[GoogleCallback] No token found in URL params:", Object.fromEntries(searchParams.entries()));
      // Maybe the token is in the hash fragment instead
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashToken = hashParams.get("accessToken") || hashParams.get("token") || hashParams.get("access_token");
        const hashRefresh = hashParams.get("refreshToken") || hashParams.get("refresh_token");
        if (hashToken) {
          console.log("[GoogleCallback] Tokens found in hash fragment, storing...");
          setTokens(hashToken, hashRefresh || undefined);
          refresh().then(() => {
            router.replace("/home");
          });
          return;
        }
      }
      // No tokens anywhere, redirect to login
      router.replace("/login");
    }
  }, [searchParams, router, refresh]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F9FB]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Signing you in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F9F9FB]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
      </div>
    }>
      <GoogleCallbackInner />
    </Suspense>
  );
}
