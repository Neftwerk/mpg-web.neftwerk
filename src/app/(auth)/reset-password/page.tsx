import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "New password | My Pocket Gallery",
};

function ResetPasswordFallback() {
  return (
    <div className="auth-form">
      <p className="auth-section-title">Choose a new password</p>
      <div className="auth-rule" />
      <p className="auth-paragraph muted">Loading…</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell titleKey="auth.newPasswordTitle" historyBack>
      <div className="auth-card">
        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
