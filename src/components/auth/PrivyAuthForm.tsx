"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { privyLogin } from "@/lib/auth-service";
import { useUser } from "@/lib/UserContext";

export function PrivyAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { refresh } = useUser();
  const { ready, authenticated, login } = usePrivy();
  const { identityToken } = useIdentityToken();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !identityToken || signingIn) return;

    setSigningIn(true);
    setError("");

    privyLogin(identityToken)
      .then(async (result) => {
        if (!result.ok) {
          setError(result.message || "Something went wrong. Please try again.");
          setSigningIn(false);
          return;
        }
        await refresh();
        router.push(redirectTo?.startsWith("/") ? redirectTo : "/home");
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setSigningIn(false);
      });
  }, [authenticated, identityToken, signingIn, refresh, router, redirectTo]);

  return (
    <div className="flex flex-col gap-0">
      <p className="mb-2 text-xl font-semibold text-slate-900">
        Log in or create an account to build your own gallery and join the community.
      </p>
      <div className="mb-2 h-1.5 w-[9%] max-w-[72px] bg-sky-900" />

      {error && (
        <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-7 flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => login()}
          disabled={!ready || signingIn}
          className="btn-neumorph w-[85%] max-w-[320px] disabled:opacity-50"
        >
          {signingIn ? "Signing in..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
