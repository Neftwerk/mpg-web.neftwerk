import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password | Neft Mobile Web",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password" historyBack>
      <div className="auth-card">
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
