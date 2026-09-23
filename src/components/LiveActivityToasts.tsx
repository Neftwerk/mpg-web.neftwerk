"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/Toast";
import { normalizeEnquiryId } from "@/lib/enquiry-service";
import { useSocket } from "@/lib/SocketContext";
import { useUser } from "@/lib/UserContext";
import type { EnquiryMessageNewPayload } from "@/lib/use-enquiry-socket";

/** Shape the backend would send on a notification push. All fields optional —
 *  the toast degrades to a generic line rather than printing "undefined". */
interface NotificationPushPayload {
  title?: string;
  message?: string;
  body?: string;
}

/**
 * Turns server pushes into toasts, anywhere in the app.
 *
 * `useEnquirySocket` already handles these events, but only on the screens that
 * mount it — the inbox, a thread, the admin queue. A collector sitting on
 * Discover heard nothing. This listens for the whole session instead.
 *
 * Renders nothing; it only subscribes.
 */
export function LiveActivityToasts() {
  const socket = useSocket();
  const { showToast } = useToast();
  const { user } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (payload: EnquiryMessageNewPayload) => {
      // Your own message, echoed back by the server. Not news.
      const sender = normalizeEnquiryId(payload?.message?.senderId);
      if (sender && sender === normalizeEnquiryId(user?.id)) return;
      // Already reading this thread — the message lands on screen by itself.
      if (pathname === `/messages/${payload?.enquiryId}`) return;

      const who = payload?.message?.senderName?.trim();
      showToast(who ? `New message from ${who}` : "New message");
    };

    const handleNotification = (payload?: NotificationPushPayload) => {
      if (pathname === "/notifications") return;
      const text =
        payload?.title?.trim() || payload?.message?.trim() || payload?.body?.trim();
      showToast(text || "You have a new notification");
    };

    socket.on("enquiry:message_new", handleMessage);
    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("enquiry:message_new", handleMessage);
      socket.off("notification:new", handleNotification);
    };
  }, [socket, showToast, user?.id, pathname]);

  return null;
}
