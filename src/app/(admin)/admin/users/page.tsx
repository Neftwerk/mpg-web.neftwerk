"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Search, X, ShieldAlert, Award, ArrowUpRight, History, Package, AlertTriangle, UserMinus, ShieldCheck } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  emailMasked: string;
  wallet: string;
  galleryAffiliation: string;
  joined: string;
  lastActive: string;
  status: "ACTIVE" | "DISABLED";
  avatarInitials: string;
  anomalyFlag?: string;
  tokens: { title: string; collection: string; acquired: string; commitHash: string }[];
  transactions: { type: "SALE" | "GIFT" | "CUSTODY"; hash: string; date: string; pipeline: "Initiated" | "Claimed" | "Minted" }[];
}

const MOCK_USERS: UserProfile[] = [
  {
    id: "usr-901",
    name: "Jin Park",
    emailMasked: "j***.p***k@gmail.com",
    wallet: "GCKFBEIYTKP3BPNM5Y72YOILXDGJ6ZV2IUCWQXQ7J3WYVZPQJM4Y3RK",
    galleryAffiliation: "Meridian Contemporary",
    joined: "2026-01-11",
    lastActive: "2026-05-24",
    status: "ACTIVE",
    avatarInitials: "JP",
    tokens: [
      {
        title: "Chromatic Dissolution No. 4",
        collection: "Inaugural Drop",
        acquired: "2026-01-12",
        commitHash: "0x8921df...77a819",
      },
    ],
    transactions: [
      { type: "SALE", hash: "0x819284...c9281a", date: "2026-01-12", pipeline: "Minted" },
    ],
  },
  {
    id: "usr-902",
    name: "Sofia Reyes",
    emailMasked: "s***a.r***s@yahoo.com",
    wallet: "GDKLP5NZYMF3VCFKJFVH2H3RJVMCXBKHQMFJTQAHLZ6DTQZVBWQO5VY",
    galleryAffiliation: "Vessel Art Space",
    joined: "2026-02-15",
    lastActive: "2026-05-25",
    status: "ACTIVE",
    avatarInitials: "SR",
    anomalyFlag: "WARNING: High-frequency claim requests detected from current IP pool.",
    tokens: [
      {
        title: "Sovereign Blue",
        collection: "Inaugural Drop",
        acquired: "2026-05-18",
        commitHash: "0xbafbe...aa3f62",
      },
    ],
    transactions: [
      { type: "SALE", hash: "0xb81a92...82aa1c", date: "2026-05-18", pipeline: "Claimed" },
      { type: "GIFT", hash: "0xf9281a...d928a4", date: "2026-05-20", pipeline: "Initiated" },
    ],
  },
  {
    id: "usr-903",
    name: "Alex Mercer",
    emailMasked: "a***x.m***r@protonmail.com",
    wallet: "GB7N4KYDZYMF3VCFKJFVH2H3RJVMCXBKHQMFJTQAHLZ6DTQZVBG87N3H",
    galleryAffiliation: "None",
    joined: "2026-04-10",
    lastActive: "2026-04-12",
    status: "DISABLED",
    avatarInitials: "AM",
    tokens: [],
    transactions: [
      { type: "CUSTODY", hash: "0xc81a92...aa8291", date: "2026-04-10", pipeline: "Initiated" },
    ],
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail Drawer State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"assets" | "transactions" | "affiliation">("assets");

  // Search Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.emailMasked.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (user: UserProfile) => {
    setSelectedUser(user);
    setActiveSubTab("assets");
  };

  const handleCloseDrawer = () => {
    setSelectedUser(null);
  };

  const handleToggleStatus = (id: string) => {
    if (confirm("Elevated action: Toggle user account operational privileges?")) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === id) {
            const nextStatus = u.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
            // Update selected user view if open
            setSelectedUser((prevSel) => prevSel && prevSel.id === id ? { ...prevSel, status: nextStatus } : prevSel);
            return { ...u, status: nextStatus };
          }
          return u;
        })
      );
      alert("Operational privilege updated.");
    }
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => <code className="text-xs font-mono font-bold text-[#1A3F6C]">{row.id}</code>,
    },
    {
      key: "name",
      header: "Collector Name",
      render: (row) => <span className="font-extrabold text-[#11181c]">{row.name}</span>,
    },
    {
      key: "emailMasked",
      header: "Email Address",
      render: (row) => <span className="text-xs text-[#11181c]/70 font-semibold">{row.emailMasked}</span>,
    },
    {
      key: "wallet",
      header: "Stellar Wallet Address",
      render: (row) => (
        <code className="text-[10px] font-bold text-slate-500 font-mono">
          {row.wallet.substring(0, 6)}...{row.wallet.substring(row.wallet.length - 4)}
        </code>
      ),
    },
    {
      key: "galleryAffiliation",
      header: "Affiliation",
      render: (row) => (
        <span className="text-xs font-bold text-[#1A3F6C]">
          {row.galleryAffiliation}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (row) => <span className="text-xs font-bold">{row.joined}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} variant="user" />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button onClick={() => handleRowClick(row)} className="btn-neumorph px-2 py-1 text-xs font-bold">
          Profile Log
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
          Users & Collectors
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
          Query collector records, transaction commitments, and evaluate transaction risk
        </p>
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
            placeholder="Search collector name, email, wallet or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-neumorph w-full pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="field-label whitespace-nowrap mb-0">Status Limit:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-neumorph text-xs font-bold uppercase tracking-wider py-1.5"
          >
            <option value="ALL">All Accounts</option>
            <option value="ACTIVE">Active Privileges</option>
            <option value="DISABLED">Disabled / Blocked</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <div className="w-full">
        <DataTable columns={columns} data={filteredUsers} onRowClick={handleRowClick} />
      </div>

      {/* RIGHT SIDE DRAWER - USER DETAIL WORKSPACE */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#f5f0ec] z-50 transition-transform duration-300 overflow-y-auto ${
          selectedUser ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: "-6px 0 20px rgba(229, 222, 217, 1)",
          borderLeft: "2px solid #1A3F6C",
        }}
      >
        {selectedUser && (
          <div className="p-6 flex flex-col min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#1A3F6C]/60 uppercase tracking-widest block">
                  Collector Portfolio Workspace
                </span>
                <h3 className="text-base font-black text-[#1A3F6C] uppercase tracking-wider">
                  User Details
                </h3>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-1 hover:bg-black/5 text-[#1A3F6C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Summary Card */}
            <div className="card-neumorph p-4 flex gap-4 items-center">
              <div className="w-12 h-12 bg-[#1A3F6C] text-[#f5f0ec] font-extrabold text-lg flex items-center justify-center shrink-0">
                {selectedUser.avatarInitials}
              </div>
              <div className="text-left leading-none space-y-1">
                <h4 className="text-sm font-black uppercase text-[#11181c] tracking-wide">
                  {selectedUser.name}
                </h4>
                <span className="text-[10px] text-[#11181c]/70 font-semibold block">
                  {selectedUser.emailMasked}
                </span>
                <code className="text-[9px] font-bold text-slate-500 font-mono block">
                  Wallet: {selectedUser.wallet.substring(0, 10)}...
                </code>
                <span className="text-[8px] font-bold tracking-wider text-[#1A3F6C] block uppercase mt-1">
                  JOINED: {selectedUser.joined}
                </span>
              </div>
              <div className="ml-auto">
                <StatusBadge status={selectedUser.status} variant="user" />
              </div>
            </div>

            {/* Anomaly warning block */}
            {selectedUser.anomalyFlag && (
              <div className="mt-4 bg-amber-50 border border-amber-200 p-3 flex gap-2 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold block text-amber-900 mb-0.5">Anomaly Detected</span>
                  {selectedUser.anomalyFlag}
                </div>
              </div>
            )}

            {/* Sub Tabs */}
            <div className="flex border-b border-black/10 mt-6 text-[10px] font-black uppercase tracking-wider">
              <button
                onClick={() => setActiveSubTab("assets")}
                className={`flex-1 py-2 text-center border-b-2 transition-all ${
                  activeSubTab === "assets"
                    ? "border-[#1A3F6C] text-[#1A3F6C] font-extrabold"
                    : "border-transparent text-slate-400 hover:text-[#1A3F6C]"
                }`}
              >
                Assets & Tokens
              </button>
              <button
                onClick={() => setActiveSubTab("transactions")}
                className={`flex-1 py-2 text-center border-b-2 transition-all ${
                  activeSubTab === "transactions"
                    ? "border-[#1A3F6C] text-[#1A3F6C] font-extrabold"
                    : "border-transparent text-slate-400 hover:text-[#1A3F6C]"
                }`}
              >
                History & Timeline
              </button>
              <button
                onClick={() => setActiveSubTab("affiliation")}
                className={`flex-1 py-2 text-center border-b-2 transition-all ${
                  activeSubTab === "affiliation"
                    ? "border-[#1A3F6C] text-[#1A3F6C] font-extrabold"
                    : "border-transparent text-slate-400 hover:text-[#1A3F6C]"
                }`}
              >
                Affiliations
              </button>
            </div>

            {/* Tab content panel */}
            <div className="flex-1 mt-4">
              {activeSubTab === "assets" && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Natively Owned Digital Tokens
                  </span>

                  {selectedUser.tokens.length > 0 ? (
                    selectedUser.tokens.map((token, idx) => (
                      <div key={idx} className="card-neumorph p-3 flex flex-col gap-1 text-xs">
                        <div className="flex justify-between items-start">
                          <h5 className="font-extrabold text-[#11181c] uppercase">{token.title}</h5>
                          <span className="text-[8px] font-extrabold bg-[#1A3F6C]/10 text-[#1A3F6C] px-2 py-0.5">
                            {token.collection}
                          </span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 flex justify-between">
                          <span>Acquired: {token.acquired}</span>
                          <span className="font-mono lowercase tracking-normal">Commit: {token.commitHash}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs font-bold">
                      No assets found in target wallet registry.
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === "transactions" && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Token claim pipeline transfer logs
                  </span>

                  <div className="space-y-3">
                    {selectedUser.transactions.map((tx, idx) => (
                      <div key={idx} className="card-neumorph p-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-[#1A3F6C] font-extrabold">{tx.type} TRANSFER</span>
                          <span className="text-slate-400">{tx.date}</span>
                        </div>

                        {/* Pipeline chip timeline */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`status-badge text-[8px] py-0.5 px-1.5 ${
                              tx.pipeline === "Initiated" || tx.pipeline === "Claimed" || tx.pipeline === "Minted"
                                ? "bg-[#1A3F6C]/25 text-[#1A3F6C]"
                                : "bg-black/5 text-slate-400"
                            }`}
                          >
                            Initiated
                          </span>
                          <span className="text-[8px] text-slate-400">→</span>
                          <span
                            className={`status-badge text-[8px] py-0.5 px-1.5 ${
                              tx.pipeline === "Claimed" || tx.pipeline === "Minted"
                                ? "bg-[#1A3F6C]/25 text-[#1A3F6C]"
                                : "bg-black/5 text-slate-400"
                            }`}
                          >
                            Claimed
                          </span>
                          <span className="text-[8px] text-slate-400">→</span>
                          <span
                            className={`status-badge text-[8px] py-0.5 px-1.5 ${
                              tx.pipeline === "Minted"
                                ? "bg-[#1A3F6C]/25 text-[#1A3F6C]"
                                : "bg-black/5 text-slate-400"
                            }`}
                          >
                            Minted
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 font-mono pt-1 border-t border-black/5">
                          <span>hash: {tx.hash}</span>
                          <button
                            onClick={() => alert(`View hash: ${tx.hash}`)}
                            className="text-[#1A3F6C] hover:underline"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === "affiliation" && (
                <div className="space-y-4">
                  <div className="card-neumorph p-4 text-xs space-y-2">
                    <span className="field-label block text-slate-700">Official Gallery Partnerships</span>
                    <p className="font-extrabold text-[#11181c]">
                      {selectedUser.galleryAffiliation !== "None"
                        ? `Affiliated representative of: ${selectedUser.galleryAffiliation}`
                        : "No official partner credentials mapped to this account."}
                    </p>
                    {selectedUser.galleryAffiliation !== "None" && (
                      <p className="text-[10px] text-slate-500">
                        This user holds signing keys enabling digital catalog uploads for their associated gallery space.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* High-risk operations (requires privilege flag) */}
            <div className="border-t border-black/10 pt-4 mt-6 space-y-3">
              <div className="flex items-center gap-1.5 text-red-800 text-[10px] font-black uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-700" />
                <span>Elevated Administrative Actions</span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleToggleStatus(selectedUser.id)}
                  className="btn-neumorph flex-1 py-2 px-3 text-[10px] font-black uppercase text-red-700 border border-red-200 hover:bg-red-50 flex items-center justify-center gap-1"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>{selectedUser.status === "ACTIVE" ? "Revoke Access" : "Restore Access"}</span>
                </button>
                <button
                  onClick={() => alert("Risk mitigation triggered: Wallet flag dispatched.")}
                  className="btn-neumorph flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Flag Suspicious</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay backdrop */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={handleCloseDrawer}
        />
      )}
    </div>
  );
}
