"use client";

import Link from "next/link";
import type { EnquiryListItem } from "@/lib/enquiry-types";
import {
  getArtworkTitle,
  getCustomerName,
} from "@/lib/enquiry-service";

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

function statusLabel(status: EnquiryListItem["status"]): string {
  if (status === "in_progress") return "In progress";
  if (status === "closed") return "Closed";
  return "Open";
}

function statusClass(status: EnquiryListItem["status"]): string {
  if (status === "closed") return "bg-slate-100 text-slate-500";
  if (status === "in_progress") return "bg-[#38A8AB]/15 text-[#1A3F6C]";
  return "bg-amber-50 text-amber-700";
}

interface EnquiryInboxProps {
  enquiries: EnquiryListItem[];
  viewerRole?: string;
}

export function EnquiryInbox({ enquiries, viewerRole }: EnquiryInboxProps) {
  const isGalleryOwner = viewerRole === "gallery_owner";

  if (enquiries.length === 0) {
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
        <p className="text-[15px] font-semibold text-[#1A3F6C] mb-1">
          No enquiries yet
        </p>
        <p className="text-xs text-slate-400">
          {isGalleryOwner
            ? "Collector enquiries about your artworks will appear here."
            : "Tap Enquire on an artwork to start a price enquiry."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {enquiries.map((enquiry) => {
        const unread = isGalleryOwner
          ? enquiry.unreadForGallery
          : enquiry.unreadForCustomer;
        const title = getArtworkTitle(enquiry.artworkId);
        const subtitle = isGalleryOwner
          ? getCustomerName(enquiry.customerId)
          : enquiry.enquiryNumber;

        return (
          <Link
            key={enquiry._id}
            href={`/messages/${enquiry._id}`}
            className={`card-neumorph p-4 flex items-start gap-3 transition active:scale-[0.99] ${
              unread ? "border-l-4 border-l-[#38A8AB] bg-[#38A8AB]/5" : ""
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full grid place-items-center ${
                unread ? "bg-[#38A8AB]/20" : "bg-slate-100"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={unread ? "#38A8AB" : "#94a3b8"}
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-sm leading-snug truncate ${
                    unread ? "font-bold text-[#1A3F6C]" : "text-[#11181c]"
                  }`}
                >
                  {title}
                </p>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${statusClass(enquiry.status)}`}
                >
                  {statusLabel(enquiry.status)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {timeAgo(enquiry.updatedAt)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
