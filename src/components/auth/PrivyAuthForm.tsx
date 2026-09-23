"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/Spinner";
import { privyLogin } from "@/lib/auth-service";
import { useUser } from "@/lib/UserContext";

/** The three things that happen after "Continue", in the order they happen. */
const STEP_KEYS = [
  "auth.loginStepEmail",
  "auth.loginStepCode",
  "auth.loginStepDone",
] as const;

export function PrivyAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { t } = useTranslation();
  const { refresh } = useUser();
  const { ready, authenticated, login, logout } = usePrivy();
  const { identityToken } = useIdentityToken();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");
  // One exchange per identity token. `signingIn` cannot guard this: clearing it on
  // failure re-runs the effect, and since `authenticated` and `identityToken` are
  // still set it retries immediately — forever, which reads as a flood of 429s.
  const attemptedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!authenticated || !identityToken) return;
    if (attemptedToken.current === identityToken) return;

    attemptedToken.current = identityToken;
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
  }, [authenticated, identityToken, refresh, router, redirectTo]);

  const busy = !ready || signingIn;

  return (
    <div className="flex flex-col">
      <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-[#11181c]">
        {t("auth.loginWelcomeHeading")}
      </h1>
      <div className="mt-3 h-1.5 w-[72px] bg-[#1A3F6C]" />
      <p className="mt-3 text-[15px] leading-relaxed text-[#616161]">
        {t("auth.loginWelcomeBody")}
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          <p>{error}</p>
          {/* Privy still holds a session for the rejected address, so retrying the
              same token can only fail again. Clearing it is the only way back. */}
          <button
            type="button"
            onClick={() => {
              setError("");
              void logout();
            }}
            className="mt-1 underline"
          >
            {t("auth.useDifferentEmail")}
          </button>
        </div>
      )}

      {/* "Continue" hands over to a Privy dialog that asks for an email address.
          Saying so before the click is the whole point of this panel: an
          unexplained button that summons a third party asking for your email is
          the moment people leave. Mirrors "What you are signing" at checkout. */}
      <section className="mt-5 border border-[#4D91A7]/30 bg-[#4D91A7]/[0.07] p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#11181c]">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[#4D91A7]" aria-hidden />
          {t("auth.whatHappensNext")}
        </h3>
        <ol className="mt-2.5 space-y-2">
          {STEP_KEYS.map((key, index) => (
            <li key={key} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-px flex h-5 w-5 shrink-0 items-center justify-center bg-[#4D91A7]/20 text-[11px] font-bold text-[#1A3F6C]"
              >
                {index + 1}
              </span>
              <span className="text-[13px] leading-relaxed text-[#3d4a52]">
                {t(key)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-5 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => login()}
          disabled={busy}
          className="btn-neumorph w-[85%] max-w-[320px] gap-2 disabled:opacity-50"
        >
          {busy && <Spinner />}
          {signingIn
            ? t("auth.signingYouIn")
            : !ready
              ? t("common.loading")
              : t("auth.continueWithEmail")}
        </button>

        {/* The browse invitation, as a labelled link. It used to be a bare arrow
            in the top bar, which named neither where it went nor why. */}
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A3F6C] underline underline-offset-4"
        >
          {t("auth.browseWithoutAccount")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
