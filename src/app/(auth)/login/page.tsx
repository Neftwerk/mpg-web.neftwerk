import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PrivyAuthForm } from "@/components/auth/PrivyAuthForm";

export const metadata: Metadata = {
  title: "Log in | Neft Mobile Web",
};

export default function LoginPage() {
  return (
    <AuthShell titleKey="auth.shellWelcome">
      <div className="auth-card">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <PrivyAuthForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
