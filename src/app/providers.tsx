"use client";

import { UserProvider } from "@/lib/UserContext";
import { SocketProvider } from "@/lib/SocketContext";
import { I18nProvider } from "@/localization";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <UserProvider>
        <SocketProvider>{children}</SocketProvider>
      </UserProvider>
    </I18nProvider>
  );
}
