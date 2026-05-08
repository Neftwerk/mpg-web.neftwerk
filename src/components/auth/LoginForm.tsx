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

      <div className="mt-7 flex justify-center">
        <button
          type="submit"
          className="w-[60%] max-w-[320px] rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Log in
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
