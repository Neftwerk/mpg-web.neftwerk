"use client";

import { SocketFiProvider } from "@socketfi/react";
import { UserProvider } from "@/lib/UserContext";
import { SocketProvider } from "@/lib/SocketContext";
import { SocketFiRedirectHandler } from "@/components/SocketFiRedirectHandler";
import { SocketFiSessionRefreshReset } from "@/components/SocketFiSessionRefreshReset";
import { getSocketFiConfig } from "@/lib/socketfi-config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SocketFiProvider config={getSocketFiConfig()}>
      <UserProvider>
        <SocketProvider>
          <SocketFiSessionRefreshReset />
          <SocketFiRedirectHandler />
          {children}
        </SocketProvider>
      </UserProvider>
    </SocketFiProvider>
  );
}
