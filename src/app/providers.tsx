"use client";

import { UserProvider } from "@/lib/UserContext";
import { SocketProvider } from "@/lib/SocketContext";
import { SocketFiRedirectHandler } from "@/components/SocketFiRedirectHandler";
import { SocketFiSessionRefreshReset } from "@/components/SocketFiSessionRefreshReset";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SocketProvider>
        <SocketFiSessionRefreshReset />
        <SocketFiRedirectHandler />
        {children}
      </SocketProvider>
    </UserProvider>
  );
}
