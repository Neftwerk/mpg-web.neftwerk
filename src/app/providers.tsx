"use client";

import { UserProvider } from "@/lib/UserContext";
import { SocketProvider } from "@/lib/SocketContext";
import { I18nProvider } from "@/localization";
import { ToastProvider } from "@/components/Toast";
import { LiveActivityToasts } from "@/components/LiveActivityToasts";
import { NavigationHistoryTracker } from "@/components/NavigationHistoryTracker";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <UserProvider>
        <SocketProvider>
          <ToastProvider>
            <NavigationHistoryTracker />
            <LiveActivityToasts />
            {children}
          </ToastProvider>
        </SocketProvider>
      </UserProvider>
    </I18nProvider>
  );
}
