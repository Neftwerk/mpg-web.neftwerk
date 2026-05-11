"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/home");
  }

  return (
    <form className="flex flex-col gap-0" onSubmit={onSubmit}>
      <p className="mb-2 text-xl font-semibold text-slate-900">Welcome back</p>
      <div className="mb-2 h-1.5 w-[9%] max-w-[72px] rounded-full bg-sky-900 log" />
      <label className="mt-5 first:mt-4 mb-2 block text-sm font-medium text-slate-600" htmlFor="login-email">
        Email
      </label>
      <input
        id="login-email"
        className="w-full rounded-[10px] border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
      />

      <label className="mt-5 first:mt-4 mb-2 block text-sm font-medium text-slate-600" htmlFor="login-password">
        Password
      </label>
      <input
        id="login-password"
        className="w-full rounded-[10px] border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />

      <div className="mt-2 flex justify-end">
        <Link href="/forgot-password" className="text-sm font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700">
          Forgot password?
        </Link>
      </div>

      <div className="mt-7 flex flex-col items-center gap-6">
        <button
          type="submit"
          className="btn-neumorph w-[85%] max-w-[320px]"
        >
          Log in
        </button>

        <div className="flex w-[85%] max-w-[320px] items-center gap-4">
          <div className="h-px flex-1 bg-slate-300" />
          <span className="text-sm font-medium text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        <button
          type="button"
          className="btn-neumorph w-[85%] max-w-[320px] flex items-center justify-center gap-3"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700">
          Sign up
        </Link>
      </p>
    </form>
  );
}
