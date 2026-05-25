"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlusCircle, Search, Eye, Edit } from "lucide-react";

interface GalleryData {
  id: string;
  name: string;
  dba: string;
  status: "PENDING" | "IN_REVIEW" | "ACTIVE" | "SUSPENDED";
  owner: string;
  sla: string;
}

const MOCK_GALLERIES: GalleryData[] = [
  {
    id: "gal-001",
    name: "Meridian Contemporary",
    dba: "Meridian Art Group",
    status: "ACTIVE",
    owner: "Maya Okonkwo",
    sla: "24h Premium",
  },
  {
    id: "gal-002",
    name: "Lagos Black Box",
    dba: "Lagos BB Ltd",
    status: "IN_REVIEW",
    owner: "Emre Demir",
    sla: "Standard Tier",
  },
  {
    id: "gal-003",
    name: "Forma Gallery Berlin",
    dba: "Forma GMBH",
    status: "ACTIVE",
    owner: "Lena Hartmann",
    sla: "48h Basic",
  },
  {
    id: "gal-004",
    name: "Vessel Art Space",
    dba: "Vessel Collective",
    status: "PENDING",
    owner: "Jin Park",
    sla: "Standard Tier",
  },
  {
    id: "gal-005",
    name: "The Sublevel Project",
    dba: "Sublevel Art Labs",
    status: "SUSPENDED",
    owner: "Sofia Reyes",
    sla: "Custom Enterprise",
  },
];

export default function GalleriesListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filtering Logic
  const filteredGalleries = MOCK_GALLERIES.filter((gallery) => {
    const matchesSearch =
      gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gallery.dba.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gallery.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || gallery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<GalleryData>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => <code className="text-xs text-[#1A3F6C] font-bold">{row.id}</code>,
    },
    {
      key: "name",
      header: "Gallery Name",
      render: (row) => (
        <span className="font-extrabold text-[#11181c]">{row.name}</span>
      ),
    },
    {
      key: "dba",
      header: "DBA",
      render: (row) => <span className="text-xs font-bold text-[#11181c]/70">{row.dba}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} variant="gallery" />,
    },
    {
      key: "owner",
      header: "Owner",
      render: (row) => <span className="font-bold">{row.owner}</span>,
    },
    {
      key: "sla",
      header: "SLA",
      render: (row) => <span className="text-xs font-bold uppercase tracking-wider text-[#1A3F6C]">{row.sla}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/galleries/${row.id}`}
            className="btn-neumorph px-2 py-1 text-xs flex items-center gap-1 font-bold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Manage</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Galleries Directory
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Monitor and onboard active gallery partners
          </p>
        </div>

        <Link
          href="/admin/galleries/new"
          className="btn-neumorph py-2.5 px-4 font-bold text-sm gap-2 flex items-center self-start sm:self-auto"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Onboard Gallery</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-neumorph p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1A3F6C]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search name, DBA, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-neumorph w-full pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="field-label whitespace-nowrap mb-0">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-neumorph text-xs font-bold uppercase tracking-wider py-1.5 border-b-2"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full">
        <DataTable columns={columns} data={filteredGalleries} />
      </div>
    </div>
  );
}
