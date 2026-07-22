import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up | Neft Mobile Web",
};

export default function SignupPage() {
  return (
    <AuthShell titleKey="auth.shellWelcome">
      <div className="auth-card">
        <SignupForm />
      </div>
    </AuthShell>
  );
}
