"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  verifyLoginOtp,
  verifyEmail,
  requestLoginOtp,
  setTokens,
} from "@/lib/auth-service";

export function OtpForm() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [flow, setFlow] = useState<"login" | "verify-email">("login");

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("neft_otp_email") || "";
    const storedFlow = sessionStorage.getItem("neft_otp_flow") || "login";
    setEmail(storedEmail);
    setFlow(storedFlow === "verify-email" ? "verify-email" : "login");

    if (!storedEmail) {
      // If no email stored, redirect back to login
      router.push("/login");
    }
  }, [router]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }
      setCode(newCode);
      // Focus the next empty input or the last one
      const nextEmpty = newCode.findIndex((d) => !d);
      const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs[focusIdx].current?.focus();
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otp = code.join("");
    if (otp.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      if (flow === "verify-email") {
        // Verify email after registration — backend expects { token }
        const result = await verifyEmail({ token: otp });

        if (result.ok) {
          // After email verification, clear the flow flag and redirect to login
          sessionStorage.removeItem("neft_otp_flow");
          sessionStorage.removeItem("neft_otp_email");
          setSuccess("Email verified successfully! Redirecting to login...");
          setTimeout(() => router.push("/login"), 1500);
        } else {
          setError(result.message || "Invalid verification code. Please try again.");
        }
      } else {
        // Login OTP verification
        const result = await verifyLoginOtp({ email, otp });

        if (result.ok) {
          // Store tokens from the response
          // Backend returns { success, data: { accessToken, refreshToken } }
          // Our apiFetch returns the full JSON as result.data
          const raw = result.data as Record<string, unknown>;
          const nested = (raw?.data || raw) as { accessToken?: string; refreshToken?: string };
          if (nested.accessToken) {
            setTokens(nested.accessToken, nested.refreshToken);
          }

          // Cleanup
          sessionStorage.removeItem("neft_otp_email");
          sessionStorage.removeItem("neft_otp_flow");

          // Navigate to home
          router.push("/home");
        } else {
          setError(result.message || "Invalid OTP. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const result = await requestLoginOtp({ email });
      if (result.ok) {
        setSuccess("A new code has been sent to your email.");
        setCode(["", "", "", "", "", ""]);
        inputRefs[0].current?.focus();
      } else {
        setError(result.message || "Failed to resend code.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form className="flex flex-col gap-0 items-center" onSubmit={onSubmit}>
      <p className="mb-2 text-xl font-semibold text-slate-900">
        {flow === "verify-email" ? "Verify Your Email" : "Enter OTP"}
      </p>
      <div className="mb-6 h-1.5 w-[9%] max-w-[72px] bg-sky-900" />

      <p className="text-sm text-slate-600 mb-4 text-center leading-relaxed">
        {flow === "verify-email"
          ? "We've sent a verification code to your email. Please enter it below to complete registration."
          : "We've sent a one-time password to your email address. Please enter it below."}
      </p>

      {email && (
        <p className="text-xs text-slate-400 mb-6 text-center">{email}</p>
      )}

      {error && (
        <div className="w-full rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 mb-4 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="w-full rounded-none border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600 mb-4 text-center">
          {success}
        </div>
      )}

      <div className="flex gap-2 sm:gap-3 mb-10 w-full justify-center">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-none border border-slate-300 bg-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        ))}
      </div>

      <div className="mt-2 flex flex-col items-center gap-6 w-full">
        <button
          type="submit"
          disabled={loading}
          className="btn-neumorph w-[85%] max-w-[320px] disabled:opacity-50"
        >
          {loading
            ? "Verifying..."
            : flow === "verify-email"
            ? "Verify Email"
            : "Verify OTP"}
        </button>

        <p className="text-sm text-slate-500">
          Didn&apos;t receive code?{" "}
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700 disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to login
        </Link>
      </div>
    </form>
  );
}
