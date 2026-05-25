"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlusCircle, Key, Trash2, ShieldAlert, X, Power, ShieldCheck } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
  mfaStatus: boolean;
  lastLogin: string;
  status: "ACTIVE" | "DISABLED";
}

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: "adm-01",
    name: "Adaeze Nwosu",
    email: "adaeze@neftwerk.com",
    role: "SUPER_ADMIN",
    mfaStatus: true,
    lastLogin: "2026-05-25 12:45",
    status: "ACTIVE",
  },
  {
    id: "adm-02",
    name: "Tobias Kraft",
    email: "tobias@neftwerk.com",
    role: "ADMIN",
    mfaStatus: true,
    lastLogin: "2026-05-25 11:02",
    status: "ACTIVE",
  },
  {
    id: "adm-03",
    name: "Yemi Adeyemi",
    email: "yemi@neftwerk.com",
    role: "MODERATOR",
    mfaStatus: false,
    lastLogin: "2026-05-24 16:30",
    status: "ACTIVE",
  },
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);

  // Modal Open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New admin form fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"SUPER_ADMIN" | "ADMIN" | "MODERATOR">("ADMIN");
  const [newMfa, setNewMfa] = useState(true);

  // Actions
  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newAdmin: AdminUser = {
      id: `adm-${Date.now().toString().slice(-2)}`,
      name: newName,
      email: newEmail,
      role: newRole,
      mfaStatus: newMfa,
      lastLogin: "Never",
      status: "ACTIVE",
    };

    setAdmins((prev) => [newAdmin, ...prev]);
    setIsModalOpen(false);
    // Reset
    setNewName("");
    setNewEmail("");
    setNewRole("ADMIN");
    setNewMfa(true);
    alert("New admin seat created successfully!");
  };

  const handleRevokeSession = (id: string) => {
    if (confirm("Are you sure you want to revoke all active sessions for this administrator? They will be forced to log in again.")) {
      alert(`Session keys successfully purged for ${id}.`);
    }
  };

  const handleToggleStatus = (id: string) => {
    if (confirm("Toggle operational status for this administrator? Disabled admins cannot authenticate.")) {
      setAdmins((prev) =>
        prev.map((adm) =>
          adm.id === id
            ? { ...adm, status: adm.status === "ACTIVE" ? "DISABLED" : "ACTIVE" }
            : adm
        )
      );
    }
  };

  const handleDeleteAdmin = (id: string) => {
    const reason = prompt("This action is DESTRUCTIVE. Enter deletion audit reason to continue:");
    if (reason) {
      if (confirm(`Confirm permanent deletion of ${id}? This cannot be undone.`)) {
        setAdmins((prev) => prev.filter((adm) => adm.id !== id));
        alert(`Admin seat ${id} removed under audit reference: ${reason}`);
      }
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => <code className="text-xs font-mono font-bold text-[#1A3F6C]">{row.id}</code>,
    },
    {
      key: "name",
      header: "Admin Name",
      render: (row) => <span className="font-extrabold text-[#11181c]">{row.name}</span>,
    },
    {
      key: "email",
      header: "Admin Email",
      render: (row) => <span className="text-xs text-[#11181c]/70 font-semibold">{row.email}</span>,
    },
    {
      key: "role",
      header: "Role Permission",
      render: (row) => (
        <span
          className={`status-badge text-[9px] ${
            row.role === "SUPER_ADMIN"
              ? "bg-purple-100 text-purple-800 border-purple-200 font-black"
              : row.role === "ADMIN"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-slate-200 text-slate-700 border-slate-300"
          }`}
        >
          {row.role.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "mfa",
      header: "MFA Status",
      render: (row) => <StatusBadge status={row.mfaStatus ? "MFA_ENABLED" : "MFA_DISABLED"} variant="user" />,
    },
    {
      key: "lastLogin",
      header: "Last Session Auth",
      render: (row) => <span className="text-xs font-bold text-slate-500">{row.lastLogin}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} variant="user" />,
    },
    {
      key: "actions",
      header: "Administrative Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => handleRevokeSession(row.id)}
            className="btn-neumorph p-1 text-[#1A3F6C]"
            title="Revoke Session Keys"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row.id)}
            className={`btn-neumorph p-1 ${row.status === "ACTIVE" ? "text-slate-600" : "text-emerald-700"}`}
            title={row.status === "ACTIVE" ? "Disable Admin" : "Enable Admin"}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          {row.role !== "SUPER_ADMIN" && (
            <button
              onClick={() => handleDeleteAdmin(row.id)}
              className="btn-neumorph p-1 text-red-700"
              title="Delete Admin seat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Admin Seat Management
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Configure administrative security privileges and multi-factor auth parameters
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-neumorph py-2.5 px-4 font-bold text-sm gap-2 flex items-center self-start sm:self-auto"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Add Admin Seat</span>
        </button>
      </div>

      {/* Security note */}
      <div className="card-neumorph p-4 border border-black/5 bg-[#1A3F6C]/5 text-xs font-semibold text-slate-700 flex gap-2 items-center">
        <ShieldAlert className="w-5 h-5 text-[#1A3F6C] shrink-0" />
        <span>MFA Enforcement is currently active globally for all Super Administrator transactions.</span>
      </div>

      {/* DataTable */}
      <div className="w-full">
        <DataTable columns={columns} data={admins} />
      </div>

      {/* CENTERED MODAL - ADD ADMIN SEAT (brutalist, dark backdrop, zero rounded corners) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop shadow */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />

          {/* Modal Card */}
          <div
            className="card-neumorph p-6 w-[400px] max-w-full relative z-10 flex flex-col gap-6"
            style={{
              border: "2px solid #1A3F6C",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-sm font-black uppercase text-[#1A3F6C] tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1A3F6C]" />
                Provision Admin Seat
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-black/5 text-[#1A3F6C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleAddAdminSubmit} className="space-y-4">
              <div>
                <label className="field-label">Administrator Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tobias Kraft"
                  className="input-neumorph w-full text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="field-label">Administrator Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. tobias@neftwerk.com"
                  className="input-neumorph w-full text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="field-label">Privilege Level</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN — Root control</option>
                  <option value="ADMIN">ADMIN — Standard privilege</option>
                  <option value="MODERATOR">MODERATOR — Forums only</option>
                </select>
              </div>

              {/* MFA Toggle switch */}
              <div className="flex items-center justify-between card-neumorph p-3 mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1A3F6C]">
                  Enforce MFA Protection
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMfa}
                    onChange={(e) => setNewMfa(e.target.checked)}
                    className="w-4 h-4 rounded-none accent-[#1A3F6C] cursor-pointer"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-4 pt-4 border-t border-black/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-neumorph flex-1 py-2 font-bold text-xs uppercase"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="btn-neumorph flex-1 py-2 font-black uppercase tracking-widest text-[#f5f0ec] bg-[#1A3F6C] text-xs"
                >
                  Create Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
