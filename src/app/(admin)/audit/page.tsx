"use client";

import React, { useState } from "react";
import { Search, Download, ChevronDown, ChevronUp, Clock, Terminal, User } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  targetEntity: string;
  targetId: string;
  timestamp: string;
  ipAddress: string;
  requestId: string;
  beforeSnapshot: Record<string, any>;
  afterSnapshot: Record<string, any>;
}

const AUDIT_DATA: AuditEntry[] = [
  {
    id: "log-8001",
    actor: "Adaeze Nwosu",
    action: "GALLERY_ACTIVATED",
    targetEntity: "Gallery Partner",
    targetId: "gal-001",
    timestamp: "2026-05-25 12:52:14",
    ipAddress: "192.168.1.45",
    requestId: "req-01HJG829A",
    beforeSnapshot: { status: "IN_REVIEW", isActive: false, approvedBy: null },
    afterSnapshot: { status: "ACTIVE", isActive: true, approvedBy: "Adaeze Nwosu" },
  },
  {
    id: "log-8002",
    actor: "Tobias Kraft",
    action: "ARTWORK_MINTED",
    targetEntity: "Digital Artwork",
    targetId: "art-1",
    timestamp: "2026-05-25 12:17:02",
    ipAddress: "192.168.1.12",
    requestId: "req-01HJG89BA",
    beforeSnapshot: { status: "READY", metadataCid: null },
    afterSnapshot: { status: "MINTED", metadataCid: "bafybeigdyrzt5s2tlfee3dlw4a3e23za77a" },
  },
  {
    id: "log-8003",
    actor: "Yemi Adeyemi",
    action: "COMMENT_REJECTED",
    targetEntity: "Forum Comment",
    targetId: "com-302",
    timestamp: "2026-05-25 11:02:45",
    ipAddress: "192.168.1.99",
    requestId: "req-01HJG9C2D",
    beforeSnapshot: { status: "PENDING", spamFlag: true },
    afterSnapshot: { status: "DELETED", auditReason: "Spam Link Advertisement" },
  },
  {
    id: "log-8004",
    actor: "Adaeze Nwosu",
    action: "ROLE_UPDATED",
    targetEntity: "Administrator seat",
    targetId: "adm-02",
    timestamp: "2026-05-25 10:14:02",
    ipAddress: "192.168.1.45",
    requestId: "req-01HJG9F1E",
    beforeSnapshot: { role: "ADMIN", mfaStatus: false },
    afterSnapshot: { role: "SUPER_ADMIN", mfaStatus: true },
  },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>(AUDIT_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  // Expandable row state
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesEntity = entityFilter === "ALL" || log.targetEntity === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  // Dynamic CSV Download
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Actor,Action,Target Entity,Target ID,IP Address,Request ID\n";

    filteredLogs.forEach((log) => {
      csvContent += `${log.timestamp},"${log.actor}",${log.action},"${log.targetEntity}",${log.targetId},${log.ipAddress},${log.requestId}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neftwerk_audit_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
            Immutable Audit Trail
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
            Cryptographically chronological records of all dashboard actions and parameter overrides
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-neumorph py-2.5 px-4 font-bold text-sm gap-2 flex items-center self-start sm:self-auto"
        >
          <Download className="w-4.5 h-4.5" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="card-neumorph p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1A3F6C]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search actor, target ID, request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-neumorph w-full pl-9"
          />
        </div>

        {/* Action and Target Type select dropdowns */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="field-label whitespace-nowrap mb-0">Action:</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="input-neumorph text-xs font-bold uppercase tracking-wider py-1.5"
            >
              <option value="ALL">All Actions</option>
              <option value="GALLERY_ACTIVATED">GALLERY ACTIVATED</option>
              <option value="ARTWORK_MINTED">ARTWORK MINTED</option>
              <option value="COMMENT_REJECTED">COMMENT REJECTED</option>
              <option value="ROLE_UPDATED">ROLE UPDATED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="field-label whitespace-nowrap mb-0">Entity:</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="input-neumorph text-xs font-bold uppercase tracking-wider py-1.5"
            >
              <option value="ALL">All Entities</option>
              <option value="Gallery Partner">Gallery Partner</option>
              <option value="Digital Artwork">Digital Artwork</option>
              <option value="Forum Comment">Forum Comment</option>
              <option value="Administrator seat">Administrator seat</option>
            </select>
          </div>
        </div>
      </div>

      {/* INSET CONTAINER FOR TABLE (Alternating tints, slightly recessed) */}
      <div
        className="card-neumorph-inset p-2 overflow-hidden"
        style={{
          boxShadow: "inset 3px 3px 8px rgba(229, 222, 217, 1), inset -3px -3px 8px rgba(255, 255, 255, 1)",
        }}
      >
        <div className="overflow-x-auto w-full bg-[#f5f0ec]">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-[#1A3F6C]/20 bg-black/5">
                <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-[#1A3F6C]/80">Actor</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-[#1A3F6C]/80">Action Name</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-[#1A3F6C]/80">Entity Mapping</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-[#1A3F6C]/80">Timestamp</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-[#1A3F6C]/80">IP Address</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-[#1A3F6C]/80 text-right">Request ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      {/* Standard Row */}
                      <tr
                        onClick={() => toggleRow(log.id)}
                        className="cursor-pointer table-row-hover transition-colors duration-150 odd:bg-black/[0.01] even:bg-transparent"
                      >
                        <td className="px-5 py-3.5 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#1A3F6C] opacity-60" />
                          <span className="font-extrabold text-[#11181c]">{log.actor}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <code className="text-[10px] font-bold text-[#1A3F6C] bg-[#1A3F6C]/10 px-2.5 py-0.5 rounded-none tracking-normal">
                            {log.action}
                          </code>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[#11181c]/70 block font-extrabold">{log.targetEntity}</span>
                          <span className="text-[9px] font-mono block text-[#1A3F6C]/60 lowercase">id: {log.targetId}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-bold flex items-center gap-1.5 py-4">
                          <Clock className="w-3 h-3 shrink-0 text-slate-400" />
                          {log.timestamp}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono font-medium">{log.ipAddress}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-[#1A3F6C] font-extrabold">{log.requestId}</td>
                      </tr>

                      {/* Expandable row: Snapshot JSON Difference display */}
                      {isExpanded && (
                        <tr className="bg-black/[0.03]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="card-neumorph-inset p-4 bg-[#f2ede9] space-y-4">
                              <div className="flex items-center gap-1.5 text-[#1A3F6C]">
                                <Terminal className="w-4 h-4 text-[#1A3F6C]" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                  State Parameter Difference Snapshots
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                                {/* Before Block */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-red-800 block">
                                    [BEFORE LOG PARAMETERS]
                                  </span>
                                  <pre className="p-3 bg-red-50/50 border border-red-200 text-red-900 font-bold overflow-x-auto text-[10px] leading-relaxed">
                                    {JSON.stringify(log.beforeSnapshot, null, 2)}
                                  </pre>
                                </div>

                                {/* After Block */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-green-800 block">
                                    [AFTER LOG PARAMETERS]
                                  </span>
                                  <pre className="p-3 bg-green-50/50 border border-green-200 text-green-900 font-bold overflow-x-auto text-[10px] leading-relaxed">
                                    {JSON.stringify(log.afterSnapshot, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                    No matching audit sequences found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
