import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpForm } from "@/components/auth/OtpForm";

export const metadata: Metadata = {
  title: "Verify OTP | My Pocket Gallery",
};

export default function OtpPage() {
  return (
    <AuthShell titleKey="auth.verifyOtpTitle" historyBack>
      <div className="auth-card">
        <OtpForm />
      </div>
    </AuthShell>
  );
}
