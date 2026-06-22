"use client";

import { useEffect } from "react";
import type { EnquiryMessage, EnquiryStatus } from "@/lib/enquiry-types";
import { joinEnquiryRoom, leaveEnquiryRoom } from "@/lib/socket-service";
import { useSocket } from "@/lib/SocketContext";

export interface EnquiryMessageNewPayload {
  enquiryId: string;
  message: EnquiryMessage;
}

export interface EnquiryStatusChangedPayload {
  enquiryId: string;
  status: EnquiryStatus;
  prev: EnquiryStatus;
}

interface UseEnquirySocketOptions {
  enquiryId?: string | null;
  onMessageNew?: (payload: EnquiryMessageNewPayload) => void;
  onStatusChanged?: (payload: EnquiryStatusChangedPayload) => void;
  onInboxUpdate?: () => void;
}

export function useEnquirySocket({
  enquiryId,
  onMessageNew,
  onStatusChanged,
  onInboxUpdate,
}: UseEnquirySocketOptions): void {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleCreated = () => {
      onInboxUpdate?.();
    };

    const handleMessageNew = (payload: EnquiryMessageNewPayload) => {
      if (enquiryId && payload.enquiryId === enquiryId) {
        onMessageNew?.(payload);
      } else if (!enquiryId) {
        onInboxUpdate?.();
      }
    };

    const handleStatusChanged = (payload: EnquiryStatusChangedPayload) => {
      if (enquiryId && payload.enquiryId === enquiryId) {
        onStatusChanged?.(payload);
      } else if (!enquiryId) {
        onInboxUpdate?.();
      }
    };

    socket.on("enquiry:created", handleCreated);
    socket.on("enquiry:message_new", handleMessageNew);
    socket.on("enquiry:status_changed", handleStatusChanged);

    return () => {
      socket.off("enquiry:created", handleCreated);
      socket.off("enquiry:message_new", handleMessageNew);
      socket.off("enquiry:status_changed", handleStatusChanged);
    };
  }, [socket, enquiryId, onMessageNew, onStatusChanged, onInboxUpdate]);

  useEffect(() => {
    if (!socket || !enquiryId) return;

    joinEnquiryRoom(enquiryId);
    return () => {
      leaveEnquiryRoom(enquiryId);
    };
  }, [socket, enquiryId]);
}
