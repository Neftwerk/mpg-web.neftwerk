"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { initiateGoogleOAuth, requestLoginOtp, verifyLoginOtp, setTokens } from "@/lib/auth-service";
import { useUser } from "@/lib/UserContext";

export function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { refresh } = useUser();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }
      setCode(newCode);
      const nextEmpty = newCode.findIndex((d) => !d);
      const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs[focusIdx].current?.focus();
    }
  }

  function handleChangeEmail() {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setError("");
  }

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const result = await requestLoginOtp({ email: email.trim() });

    if (result.ok) {
      setStep("otp");
    } else {
      setError(result.message || t("auth.errors.otpSendFailed"));
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length < 6) {
      setError(t("auth.errors.otpFull"));
      return;
    }
    setLoading(true);
    setError("");

    const result = await verifyLoginOtp({ email: email.trim(), otp });

    if (result.ok && result.data) {
      // Extract tokens from the response
      const responseData = (result.data as any)?.data || result.data;
      const accessToken = responseData?.accessToken || responseData?.token || responseData?.access_token;
      const refreshToken = responseData?.refreshToken || responseData?.refresh_token;

      if (accessToken) {
        setTokens(accessToken, refreshToken);
        await refresh();
        router.push(redirectTo?.startsWith("/") ? redirectTo : "/home");
      } else {
        setError(t("auth.errors.noToken"));
      }
    } else {
      setError(result.message || t("auth.errors.otpInvalid"));
    }
    setLoading(false);
  }

  return (
    <form className="flex flex-col gap-0" onSubmit={step === "email" ? handleRequestOtp : handleVerifyOtp}>
      <p className="mb-2 text-xl font-semibold text-slate-900">
        {t("auth.loginHeading")}
      </p>
      <div className="mb-2 h-1.5 w-[9%] max-w-[72px] bg-sky-900 log" />

      {error && (
        <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === "email" && (
        <>
          <label className="mt-5 first:mt-4 mb-2 block text-sm font-medium text-slate-600" htmlFor="login-email">
            {t("auth.emailLabel")}
          </label>
          <input
            id="login-email"
            className="w-full border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </>
      )}

      {step === "otp" && (
        <>
          <p className="mt-5 text-sm text-slate-600 leading-relaxed">
            {t("auth.otpSentTo")}{" "}
            <strong className="text-slate-800">{email}</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-[#1A3F6C] font-semibold hover:underline underline-offset-2"
            >
              {t("auth.notYou")}
            </button>
          </p>

          <label className="mt-5 mb-3 block text-sm font-medium text-slate-600">
            {t("auth.enterOtpCode")}
          </label>
          <div className="flex gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                autoFocus={index === 0}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border border-slate-300 bg-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-7 flex flex-col items-center gap-6">
        <div className="flex w-full flex-col items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-neumorph w-[85%] max-w-[320px] disabled:opacity-50"
          >
            {loading
              ? t("common.pleaseWait")
              : step === "email"
                ? t("auth.loginButton")
                : t("auth.verifyAndLogin")}
          </button>

          {step === "email" && (
            <p className="text-center text-sm text-slate-500">
              {t("auth.noAccount")}{" "}
              <Link href="/signup" className="font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700">
                {t("auth.signUp")}
              </Link>
            </p>
          )}
        </div>

        {step === "email" && (
          <>
            <div className="flex w-[85%] max-w-[320px] items-center gap-4">
              <div className="h-px flex-1 bg-slate-300" />
              <span className="text-sm font-medium text-slate-500">{t("common.or")}</span>
              <div className="h-px flex-1 bg-slate-300" />
            </div>

            <button
              type="button"
              onClick={() => initiateGoogleOAuth()}
              className="btn-neumorph w-[85%] max-w-[320px] flex items-center justify-center gap-3"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("auth.continueWithGoogle")}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

