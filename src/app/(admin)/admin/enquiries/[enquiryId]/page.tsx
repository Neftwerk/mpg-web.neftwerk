"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminEnquiryControls } from "@/components/messages/AdminEnquiryControls";
import { EnquiryThread } from "@/components/messages/EnquiryThread";
import { useUser } from "@/lib/UserContext";
import type { EnquiryDetail } from "@/lib/enquiry-types";
import { isUserAssignedToEnquiry } from "@/lib/enquiry-service";

export default function AdminEnquiryDetailPage() {
  const params = useParams();
  const { user } = useUser();
  const enquiryId =
    typeof params.enquiryId === "string" ? params.enquiryId : "";
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);

  if (!enquiryId) {
    return (
      <div className="card-neumorph text-center py-10">
        <p className="text-sm text-red-500">Invalid enquiry.</p>
      </div>
    );
  }

  const assigned = enquiry
    ? isUserAssignedToEnquiry(enquiry, user?.id)
    : false;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <Link
          href="/admin/enquiries"
          className="text-xs font-bold text-[#38A8AB] uppercase tracking-wider hover:underline"
        >
          ← All enquiries
        </Link>
        <h1 className="text-2xl font-extrabold text-[#1A3F6C] mt-2">
          Enquiry thread
        </h1>
      </div>

      {enquiry && (
        <AdminEnquiryControls
          enquiry={enquiry}
          userId={user?.id}
          onUpdated={setEnquiry}
        />
      )}

      <EnquiryThread
        enquiryId={enquiryId}
        adminMode
        backHref="/admin/enquiries"
        onEnquiryUpdated={setEnquiry}
        canReply={assigned}
      />
    </div>
  );
}
