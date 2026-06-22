"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/UserContext";
import type { EnquiryDetail, EnquiryMessage } from "@/lib/enquiry-types";
import {
  getAdminEnquiry,
  getArtworkTitle,
  getEnquiry,
  isUserAssignedToEnquiry,
  markAdminEnquiryRead,
  markEnquiryRead,
  normalizeEnquiryId,
  sendAdminEnquiryMessage,
  sendEnquiryMessage,
} from "@/lib/enquiry-service";
import { useEnquirySocket } from "@/lib/use-enquiry-socket";

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: EnquiryDetail["status"]): string {
  if (status === "in_progress") return "In progress";
  if (status === "closed") return "Closed";
  return "Open";
}

function serializeMessage(message: EnquiryMessage): EnquiryMessage {
  return {
    ...message,
    _id: normalizeEnquiryId(message._id),
    senderId: normalizeEnquiryId(message.senderId),
    createdAt:
      typeof message.createdAt === "string"
        ? message.createdAt
        : new Date(message.createdAt).toISOString(),
  };
}

interface EnquiryThreadProps {
  enquiryId: string;
  adminMode?: boolean;
  backHref?: string;
  onEnquiryUpdated?: (enquiry: EnquiryDetail) => void;
  canReply?: boolean;
}

export function EnquiryThread({
  enquiryId,
  adminMode = false,
  backHref = "/messages",
  onEnquiryUpdated,
  canReply,
}: EnquiryThreadProps) {
  const { user } = useUser();
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const applyEnquiry = useCallback(
    (next: EnquiryDetail) => {
      setEnquiry(next);
      onEnquiryUpdated?.(next);
    },
    [onEnquiryUpdated],
  );

  const loadEnquiry = useCallback(async () => {
    setLoading(true);
    const res = adminMode
      ? await getAdminEnquiry(enquiryId)
      : await getEnquiry(enquiryId);

    if (res.ok) {
      applyEnquiry(res.data.enquiry);
      setError("");

      if (adminMode) {
        if (isUserAssignedToEnquiry(res.data.enquiry, user?.id)) {
          await markAdminEnquiryRead(enquiryId);
        }
      } else {
        await markEnquiryRead(enquiryId);
      }
    } else {
      setError(res.message || "Could not load this enquiry.");
      setEnquiry(null);
    }

    setLoading(false);
  }, [adminMode, applyEnquiry, enquiryId, user?.id]);

  useEffect(() => {
    loadEnquiry();
  }, [loadEnquiry]);

  const handleMessageNew = useCallback(
    (payload: { enquiryId: string; message: EnquiryMessage }) => {
      if (payload.enquiryId !== enquiryId) return;

      const incoming = serializeMessage(payload.message);
      setEnquiry((current) => {
        if (!current) return current;
        if (current.messages.some((m) => m._id === incoming._id)) {
          return current;
        }
        const next = {
          ...current,
          messages: [...current.messages, incoming],
        };
        onEnquiryUpdated?.(next);
        return next;
      });
    },
    [enquiryId, onEnquiryUpdated],
  );

  const handleStatusChanged = useCallback(
    (payload: { enquiryId: string; status: EnquiryDetail["status"] }) => {
      if (payload.enquiryId !== enquiryId) return;
      setEnquiry((current) => {
        if (!current) return current;
        const next = { ...current, status: payload.status };
        onEnquiryUpdated?.(next);
        return next;
      });
    },
    [enquiryId, onEnquiryUpdated],
  );

  useEnquirySocket({
    enquiryId,
    onMessageNew: handleMessageNew,
    onStatusChanged: handleStatusChanged,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [enquiry?.messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || sending || enquiry.status === "closed") return;

    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setSendError("");

    const res = adminMode
      ? await sendAdminEnquiryMessage(enquiryId, body)
      : await sendEnquiryMessage(enquiryId, body);

    if (res.ok) {
      const message = serializeMessage(res.data.message);
      setEnquiry((current) => {
        if (!current) return current;
        if (current.messages.some((m) => m._id === message._id)) {
          return current;
        }
        const next = {
          ...current,
          messages: [...current.messages, message],
          status:
            current.status === "open" &&
            (user?.role === "gallery_owner" ||
              user?.role === "admin" ||
              user?.role === "super_admin")
              ? "in_progress"
              : current.status,
        };
        onEnquiryUpdated?.(next);
        return next;
      });
      setDraft("");
    } else {
      setSendError(res.message || "Could not send message.");
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="card-neumorph text-center py-10 mt-4">
        <p className="text-sm text-red-500 mb-3">{error || "Enquiry not found."}</p>
        <Link href={backHref} className="btn-neumorph px-6 inline-block">
          Back
        </Link>
      </div>
    );
  }

  const title = getArtworkTitle(enquiry.artworkId);
  const isClosed = enquiry.status === "closed";
  const assigned = isUserAssignedToEnquiry(enquiry, user?.id);
  const replyAllowed =
    canReply ??
    (!adminMode || assigned);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] lg:min-h-[calc(100dvh-4rem)]">
      <div className="card-neumorph p-4 mt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={backHref}
              className="text-xs font-bold text-[#38A8AB] uppercase tracking-wider hover:underline"
            >
              ← Back
            </Link>
            <h2 className="text-lg font-semibold text-[#11181c] mt-1 truncate">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{enquiry.enquiryNumber}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#38A8AB]/15 text-[#1A3F6C] shrink-0">
            {statusLabel(enquiry.status)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-3">
        {enquiry.messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={normalizeEnquiryId(message.senderId) === normalizeEnquiryId(user?.id)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {isClosed ? (
        <p className="text-center text-xs text-slate-400 pb-4">
          This enquiry is closed. No further replies can be sent.
        </p>
      ) : !replyAllowed ? (
        <p className="text-center text-xs text-slate-500 pb-4 px-4">
          Assign this enquiry to yourself before replying.
        </p>
      ) : (
        <form
          onSubmit={handleSend}
          className="sticky bottom-0 bg-[#F7F4F3]/95 backdrop-blur-sm pt-2 pb-4"
        >
          <div className="card-neumorph p-3 flex gap-2 items-end">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={5000}
              placeholder="Write a message…"
              className="flex-1 bg-transparent text-sm text-[#11181c] placeholder:text-slate-400 focus:outline-none resize-none"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="btn-neumorph !px-4 !py-2 text-sm shrink-0 disabled:opacity-50"
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
          {sendError && (
            <p className="text-xs text-red-500 mt-2 px-1">{sendError}</p>
          )}
        </form>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: EnquiryMessage;
  isOwn: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isOwn
            ? "bg-[#1A3F6C] text-white rounded-br-md"
            : "bg-white border border-slate-100 text-[#11181c] rounded-bl-md shadow-sm"
        }`}
      >
        {!isOwn && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#38A8AB] mb-1">
            {message.senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
        <p
          className={`text-[10px] mt-2 ${
            isOwn ? "text-white/70" : "text-slate-400"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
