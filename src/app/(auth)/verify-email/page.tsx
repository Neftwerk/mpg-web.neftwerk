"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { verifyEmail } from "@/lib/auth-service";

function VerifyEmailContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("auth.verifyEmail.noToken"));
      return;
    }

    async function verify() {
      const result = await verifyEmail({ token });

      if (result.ok) {
        setStatus("success");
        setMessage(t("auth.verifyEmail.successMessage"));
      } else {
        setStatus("error");
        setMessage(result.message || t("auth.verifyEmail.failedMessage"));
      }
    }

    verify();
  }, [token, t]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-5">
      <div className="w-full max-w-[400px] text-center">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/neftwerklogo.webp"
            alt="Neftwerk"
            className="h-[60px] object-contain"
          />
        </div>

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#1A3F6C]" />
            <p className="text-sm text-slate-500">{t("auth.verifyEmail.verifying")}</p>
          </div>
        )}

        {/* Success state */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-5">
            {/* Checkmark circle */}
            <div className="flex items-center justify-center w-16 h-16 bg-green-50 border-2 border-green-400">
              <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[#1A3F6C]">{t("auth.verifyEmail.verifiedTitle")}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message} {t("auth.verifyEmail.proceedToLogin")}
            </p>

            <Link
              href="/login"
              className="btn-neumorph w-[85%] max-w-[280px] mt-4"
            >
              {t("auth.verifyEmail.proceedToLogin")}
            </Link>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-5">
            {/* X circle */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-50 border-2 border-red-400">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[#1A3F6C]">{t("auth.verifyEmail.failedTitle")}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message}
            </p>

            <div className="flex flex-col items-center gap-3 mt-4 w-full">
              <Link
                href="/signup"
                className="btn-neumorph w-[85%] max-w-[280px]"
              >
                {t("auth.verifyEmail.trySignupAgain")}
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-500 hover:text-slate-700 underline underline-offset-2"
              >
                {t("auth.verifyEmail.goToLogin")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#1A3F6C]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
