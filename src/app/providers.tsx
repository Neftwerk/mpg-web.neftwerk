"use client";

import { UserProvider } from "@/lib/UserContext";
import { SocketFiRedirectHandler } from "@/components/SocketFiRedirectHandler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SocketFiRedirectHandler />
      {children}
    </UserProvider>
  );
}
