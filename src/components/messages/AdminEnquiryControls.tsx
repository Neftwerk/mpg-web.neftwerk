"use client";

import { useState } from "react";
import type { EnquiryDetail, EnquiryStatus } from "@/lib/enquiry-types";
import {
  assignEnquiryToMe,
  isUserAssignedToEnquiry,
  updateAdminEnquiryStatus,
} from "@/lib/enquiry-service";

interface AdminEnquiryControlsProps {
  enquiry: EnquiryDetail;
  userId?: string;
  onUpdated: (enquiry: EnquiryDetail) => void;
}

const STATUS_OPTIONS: EnquiryStatus[] = ["open", "in_progress", "closed"];

export function AdminEnquiryControls({
  enquiry,
  userId,
  onUpdated,
}: AdminEnquiryControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const assigned = isUserAssignedToEnquiry(enquiry, userId);

  const handleAssignMe = async () => {
    setLoading("assign");
    setError("");
    const res = await assignEnquiryToMe(enquiry._id);
    if (res.ok) {
      onUpdated(res.data.enquiry);
    } else {
      setError(res.message || "Could not assign enquiry.");
    }
    setLoading(null);
  };

  const handleStatusChange = async (status: EnquiryStatus) => {
    if (status === enquiry.status) return;
    setLoading("status");
    setError("");
    const res = await updateAdminEnquiryStatus(enquiry._id, status);
    if (res.ok) {
      onUpdated(res.data.enquiry);
    } else {
      setError(res.message || "Could not update status.");
    }
    setLoading(null);
  };

  return (
    <div className="card-neumorph p-4 mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A3F6C]/60">
            Admin controls
          </p>
          <p className="text-sm text-[#616161] mt-1">
            {assigned
              ? "You are assigned to this enquiry."
              : "Assign yourself to reply as admin support."}
          </p>
        </div>

        {!assigned && enquiry.status !== "closed" && (
          <button
            type="button"
            onClick={handleAssignMe}
            disabled={loading === "assign"}
            className="btn-neumorph !px-4 !py-2 text-sm disabled:opacity-50"
          >
            {loading === "assign" ? "Assigning…" : "Assign to me"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#1A3F6C]">Status:</span>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleStatusChange(status)}
            disabled={loading === "status"}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border transition ${
              enquiry.status === status
                ? "bg-[#1A3F6C] text-white border-[#1A3F6C]"
                : "bg-white text-[#1A3F6C] border-slate-200 hover:bg-slate-50"
            } disabled:opacity-50`}
          >
            {status.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
