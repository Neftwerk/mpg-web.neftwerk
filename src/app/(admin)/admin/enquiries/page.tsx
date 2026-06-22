"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, Inbox } from "lucide-react";
import type { EnquiryListItem, EnquiryStatus } from "@/lib/enquiry-types";
import {
  getArtworkTitle,
  getCustomerName,
  getGalleryOwnerName,
  listAdminEnquiries,
} from "@/lib/enquiry-service";
import { useEnquirySocket } from "@/lib/use-enquiry-socket";

type EnquiryRow = EnquiryListItem & { id: string };

const STATUS_FILTERS: Array<{ label: string; value?: EnquiryStatus }> = [
  { label: "All" },
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Closed", value: "closed" },
];

export default function AdminEnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | undefined>();
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    const res = await listAdminEnquiries({
      page: 1,
      limit: 100,
      status: statusFilter,
      unassigned: unassignedOnly || undefined,
    });

    if (res.ok) {
      setEnquiries(
        res.data.enquiries.map((enquiry) => ({
          ...enquiry,
          id: enquiry._id,
        })),
      );
      setError("");
    } else {
      setError(res.message || "Failed to load enquiries.");
      setEnquiries([]);
    }

    setLoading(false);
  }, [statusFilter, unassignedOnly]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEnquirySocket({
    enquiryId: null,
    onInboxUpdate: fetchEnquiries,
  });

  const filtered = enquiries.filter((enquiry) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      enquiry.enquiryNumber.toLowerCase().includes(q) ||
      getArtworkTitle(enquiry.artworkId).toLowerCase().includes(q) ||
      getCustomerName(enquiry.customerId).toLowerCase().includes(q) ||
      getGalleryOwnerName(enquiry.galleryOwnerId).toLowerCase().includes(q)
    );
  });

  const columns: Column<EnquiryRow>[] = [
    {
      key: "enquiryNumber",
      header: "Enquiry",
      render: (row) => (
        <div>
          <p className="font-semibold text-[#1A3F6C]">{row.enquiryNumber}</p>
          {row.unreadForAdmin && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#38A8AB]">
              Unread
            </span>
          )}
        </div>
      ),
    },
    {
      key: "artwork",
      header: "Artwork",
      render: (row) => getArtworkTitle(row.artworkId),
    },
    {
      key: "customer",
      header: "Collector",
      render: (row) => getCustomerName(row.customerId),
    },
    {
      key: "galleryOwner",
      header: "Gallery owner",
      render: (row) => getGalleryOwnerName(row.galleryOwnerId),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.status.toUpperCase()} variant="gallery" />
      ),
    },
    {
      key: "assigned",
      header: "Assigned",
      render: (row) =>
        row.assignedAdmins.length > 0
          ? `${row.assignedAdmins.length} admin(s)`
          : "Unassigned",
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (row) =>
        new Date(row.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
            Commerce
          </p>
          <h1 className="text-2xl font-extrabold text-[#1A3F6C] mt-1">
            Price Enquiries
          </h1>
          <p className="text-sm text-[#616161] mt-2">
            Review collector price enquiries, assign admins, and manage threads.
          </p>
        </div>
        <Link href="/messages" className="btn-neumorph !px-4 !py-2 text-sm inline-flex items-center gap-2">
          <Inbox className="w-4 h-4" />
          Collector inbox
        </Link>
      </div>

      <div className="card-neumorph p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enquiries…"
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#38A8AB]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition ${
                statusFilter === filter.value
                  ? "bg-[#1A3F6C] text-white border-[#1A3F6C]"
                  : "bg-white text-[#1A3F6C] border-slate-200 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUnassignedOnly((current) => !current)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition ${
              unassignedOnly
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-white text-[#1A3F6C] border-slate-200 hover:bg-slate-50"
            }`}
          >
            Unassigned
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3F6C] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="card-neumorph text-center py-10">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button type="button" onClick={fetchEnquiries} className="btn-neumorph px-6">
            Try again
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => router.push(`/admin/enquiries/${row.id}`)}
          emptyMessage="No enquiries match your filters."
          pageSize={12}
        />
      )}
    </div>
  );
}
