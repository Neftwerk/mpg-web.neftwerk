import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpForm } from "@/components/auth/OtpForm";

export const metadata: Metadata = {
  title: "Verify OTP | Neft Mobile Web",
};

export default function OtpPage() {
  return (
    <AuthShell title="Verify OTP" historyBack>
      <div className="auth-card">
        <OtpForm />
      </div>
    </AuthShell>
  );
}
