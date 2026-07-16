"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EnquiryListItem } from "@/lib/enquiry-types";
import {
  getArtworkTitle,
  getCustomerName,
} from "@/lib/enquiry-service";
import { EnquiryArtworkThumb } from "@/components/messages/EnquiryArtworkThumb";
import { useEnquiryArtwork } from "@/lib/use-enquiry-artwork";
import type { Notification } from "@/lib/notification-service";
import {
  getNotificationHref,
  isConversationNotification,
} from "@/lib/notification-routing";

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type InboxRow =
  | {
      kind: "conversation";
      id: string;
      at: number;
      enquiry: EnquiryListItem;
    }
  | {
      kind: "notice";
      id: string;
      at: number;
      notification: Notification;
    };

interface UnifiedInboxProps {
  enquiries: EnquiryListItem[];
  notices: Notification[];
  viewerRole?: string;
  onOpenNotice: (notification: Notification) => void;
  onDismissNotice: (id: string) => void;
}

export function UnifiedInbox({
  enquiries,
  notices,
  viewerRole,
  onOpenNotice,
  onDismissNotice,
}: UnifiedInboxProps) {
  const isGalleryOwner = viewerRole === "gallery_owner";

  // Conversation threads already cover enquiry alerts — keep one calm list
  const neftwerkNotices = notices.filter(
    (n) => !isConversationNotification(n.type),
  );

  const rows: InboxRow[] = [
    ...enquiries.map((enquiry) => ({
      kind: "conversation" as const,
      id: `c-${enquiry._id}`,
      at: new Date(enquiry.updatedAt).getTime(),
      enquiry,
    })),
    ...neftwerkNotices.map((notification) => ({
      kind: "notice" as const,
      id: `n-${notification._id}`,
      at: new Date(notification.createdAt).getTime(),
      notification,
    })),
  ].sort((a, b) => b.at - a.at);

  if (rows.length === 0) {
    return (
      <div className="card-neumorph text-center py-12 mt-4">
        <svg
          className="mx-auto mb-3 text-slate-300"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-[15px] font-medium text-[#1A3F6C] mb-1 px-4">
          {isGalleryOwner
            ? "Your inbox is quiet"
            : "Your inbox is quiet — save a message for when you're ready."}
        </p>
        <p className="text-xs text-slate-400 px-6 leading-relaxed">
          {isGalleryOwner
            ? "Conversations with collectors and notes from Neftwerk will appear here."
            : "Gallery conversations and notes from Neftwerk live here together. Check whenever you like."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {rows.map((row) =>
        row.kind === "conversation" ? (
          <ConversationRow
            key={row.id}
            enquiry={row.enquiry}
            isGalleryOwner={isGalleryOwner}
          />
        ) : (
          <NoticeRow
            key={row.id}
            notification={row.notification}
            viewerRole={viewerRole}
            onOpen={onOpenNotice}
            onDismiss={onDismissNotice}
          />
        ),
      )}
    </div>
  );
}

function ConversationRow({
  enquiry,
  isGalleryOwner,
}: {
  enquiry: EnquiryListItem;
  isGalleryOwner: boolean;
}) {
  const hasUpdate = isGalleryOwner
    ? enquiry.unreadForGallery
    : enquiry.unreadForCustomer;
  const fallbackTitle = getArtworkTitle(enquiry.artworkId);
  const { title: resolvedTitle } = useEnquiryArtwork(enquiry.artworkId);
  const title = resolvedTitle !== "Artwork" ? resolvedTitle : fallbackTitle;
  const subtitle = isGalleryOwner
    ? getCustomerName(enquiry.customerId)
    : "Gallery conversation";

  return (
    <Link
      href={`/messages/${enquiry._id}`}
      className={`card-neumorph p-4 flex items-start gap-3 transition active:scale-[0.99] ${
        hasUpdate ? "bg-[#F7F8FA]" : ""
      }`}
    >
      <EnquiryArtworkThumb artworkId={enquiry.artworkId} size="sm" />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug truncate ${
            hasUpdate ? "font-medium text-[#1A3F6C]" : "text-[#11181c]"
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
        <p className="text-[10px] text-slate-400 mt-1">
          {timeAgo(enquiry.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

function NoticeRow({
  notification,
  viewerRole,
  onOpen,
  onDismiss,
}: {
  notification: Notification;
  viewerRole?: string;
  onOpen: (notification: Notification) => void;
  onDismiss: (id: string) => void;
}) {
  const router = useRouter();
  const href = getNotificationHref(notification, viewerRole);
  const body = notification.body || notification.message || "";
  const unopened = !notification.isRead;

  const handleOpen = () => {
    onOpen(notification);
    if (href) router.push(href);
  };

  return (
    <div
      role={href ? "button" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={href ? handleOpen : () => onOpen(notification)}
      onKeyDown={
        href
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpen();
              }
            }
          : undefined
      }
      className={`card-neumorph p-4 flex items-start gap-3 transition ${
        unopened ? "bg-[#F7F8FA]" : ""
      } ${href ? "cursor-pointer active:scale-[0.99]" : ""}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#EDE9E4] grid place-items-center text-[11px] font-semibold text-[#1A3F6C]">
        N
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            unopened ? "font-medium text-[#1A3F6C]" : "text-[#11181c]"
          }`}
        >
          {notification.title || body}
        </p>
        {notification.title && body && notification.title !== body && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{body}</p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">
          Neftwerk · {timeAgo(notification.createdAt)}
        </p>
      </div>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification._id);
        }}
        className="text-slate-300 hover:text-slate-500 text-lg leading-none px-1 flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}
