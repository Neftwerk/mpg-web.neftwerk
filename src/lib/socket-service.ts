import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";
import { getAccessToken } from "./auth-service";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket | null {
  if (typeof window === "undefined" || !API_BASE_URL) return null;

  const token = getAccessToken();
  if (!token) return null;

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function joinEnquiryRoom(enquiryId: string): void {
  socket?.emit("join:enquiry", enquiryId);
}

export function leaveEnquiryRoom(enquiryId: string): void {
  socket?.emit("leave:enquiry", enquiryId);
}
