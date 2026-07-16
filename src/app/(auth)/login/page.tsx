import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | Neft Mobile Web",
};

export default function LoginPage() {
  return (
    <AuthShell title="Welcome! you're free to browse">
      <div className="auth-card">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
