import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | Neft Mobile Web",
};

export default function LoginPage() {
  return (
    <AuthShell title="Log in">
      <div className="auth-card">
        <LoginForm />
      </div>
    </AuthShell>
  );
}
