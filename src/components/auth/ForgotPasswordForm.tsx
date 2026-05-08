"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  }

  if (sent) {
    const resetHref = `/reset-password?email=${encodeURIComponent(email.trim())}`;
    return (
      <div className="flex flex-col gap-0">
        <p className="mb-2 text-xl font-semibold text-slate-900">Check your email</p>
        <div className="mb-2 h-1.5 w-[9%] max-w-[72px] rounded-full bg-sky-900" />
        <p className="text-sm leading-6 text-slate-600">
          If an account exists for{" "}
          <strong className="font-semibold text-slate-800">{email.trim()}</strong>,
          you will receive instructions to reset your password shortly.
        </p>
        <div className="mt-5 flex justify-center">
          <Link
            href={resetHref}
            className="w-[60%] max-w-[320px] rounded-full border border-sky-900 bg-transparent px-5 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-50"
          >
            I have a reset link
          </Link>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="w-[60%] max-w-[320px] rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition hover:bg-slate-100"
            onClick={() => setSent(false)}
          >
            Use a different email
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-0" onSubmit={onSubmit}>
      <p className="mb-2 text-xl font-semibold text-slate-900">Reset your password</p>
      <div className="mb-2 h-1.5 w-[9%] max-w-[72px] rounded-full bg-sky-900" />
      <p className="text-sm leading-6 text-slate-600">
        Enter the email for your account. We will send you a link to choose a new
        password.
      </p>

      <label className="mt-5 first:mt-4 mb-2 block text-sm font-medium text-slate-600" htmlFor="forgot-email">
        Email
      </label>
      <input
        id="forgot-email"
        className="w-full rounded-[10px] border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
      />

      <div className="mt-7 flex justify-center">
        <button
          type="submit"
          className="w-[60%] max-w-[320px] rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!email.trim()}
        >
          Send reset link
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
