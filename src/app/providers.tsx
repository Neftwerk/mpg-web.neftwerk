"use client";

import { UserProvider } from "@/lib/UserContext";
import { SocketFiRedirectHandler } from "@/components/SocketFiRedirectHandler";
import { SocketFiSessionRefreshReset } from "@/components/SocketFiSessionRefreshReset";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SocketFiSessionRefreshReset />
      <SocketFiRedirectHandler />
      {children}
    </UserProvider>
  );
}
