"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AppShell title="Settings">
        <p className="muted">Settings content goes here.</p>
      </AppShell>
    </AuthGuard>
  );
}
