"use client";

import { UserProvider } from "@/lib/UserContext";
import { SocketProvider } from "@/lib/SocketContext";
import { I18nProvider } from "@/localization";
import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <UserProvider>
        <SocketProvider>
          <ToastProvider>{children}</ToastProvider>
        </SocketProvider>
      </UserProvider>
    </I18nProvider>
  );
}
