import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PrivyAuthForm } from "@/components/auth/PrivyAuthForm";

export const metadata: Metadata = {
  title: "Log in | My Pocket Gallery",
};

export default function LoginPage() {
  return (
    <AuthShell>
      {/* Solid card: the deco pattern runs the full viewport now, and body copy
          read through the lattice is what made this screen feel unfinished. */}
      <div className="auth-card card-neumorph p-5">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <PrivyAuthForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
