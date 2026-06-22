"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useUser } from "@/lib/UserContext";
import { connectSocket, disconnectSocket } from "@/lib/socket-service";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    const instance = connectSocket();
    setSocket(instance);

    const handleAuthChange = () => {
      disconnectSocket();
      setSocket(connectSocket());
    };

    window.addEventListener("neft-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("neft-auth-change", handleAuthChange);
      disconnectSocket();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
