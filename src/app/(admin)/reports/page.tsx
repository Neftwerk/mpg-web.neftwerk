"use client";

import React, { useState } from "react";
import { FileText, Download, Calendar, Filter, Database, RefreshCw, CheckCircle2, History } from "lucide-react";

interface ExportHistoryItem {
  id: string;
  reportName: string;
  format: "CSV" | "PDF";
  timestamp: string;
  size: string;
  status: "READY" | "PROCESSING";
}

const INITIAL_HISTORY: ExportHistoryItem[] = [
  {
    id: "rep-9002",
    reportName: "Audit Trail Export (All Actions)",
    format: "CSV",
    timestamp: "2026-05-25 10:15",
    size: "42 KB",
    status: "READY",
  },
  {
    id: "rep-9001",
    reportName: "Meridian Contemporary — Sales",
    format: "PDF",
    timestamp: "2026-05-24 14:02",
    size: "1.2 MB",
    status: "READY",
  },
];

export default function ReportsPage() {
  const [history, setHistory] = useState<ExportHistoryItem[]>(INITIAL_HISTORY);

  // Selector states
  const [gallerySel, setGallerySel] = useState("Meridian Contemporary");
  const [galleryFormat, setGalleryFormat] = useState<"CSV" | "PDF">("CSV");

  const [royaltyPeriod, setRoyaltyPeriod] = useState("Q1 2026");
  const [auditScope, setAuditScope] = useState("ALL_ADMINS");

  // Compilation triggers
  const [compilingCard, setCompilingCard] = useState<number | null>(null);

  const handleGenerateReport = (cardId: number, name: string, format: "CSV" | "PDF") => {
    setCompilingCard(cardId);

    setTimeout(() => {
      const newItem: ExportHistoryItem = {
        id: `rep-${Date.now().toString().slice(-4)}`,
        reportName: name,
        format,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        size: format === "CSV" ? "14 KB" : "890 KB",
        status: "READY",
      };
      setHistory((prev) => [newItem, ...prev]);
      setCompilingCard(null);
      alert(`${format} report successfully generated! File added to local database registry.`);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
          Analytical Reports & Exporters
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
          Compile operational statistics, financial statements, and administrative transaction histories
        </p>
      </div>

      {/* Grid: 3 Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: SALES BY GALLERY */}
        <div className="card-neumorph p-5 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/5 pb-2">
              <FileText className="w-5 h-5 text-[#1A3F6C]" />
              <span className="text-xs font-black text-[#1A3F6C] uppercase tracking-wider">
                Sales by Gallery Partner
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="field-label">Target Partner Space</label>
                <select
                  value={gallerySel}
                  onChange={(e) => setGallerySel(e.target.value)}
                  className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                >
                  <option value="Meridian Contemporary">Meridian Contemporary</option>
                  <option value="Lagos Black Box">Lagos Black Box</option>
                  <option value="Forma Gallery Berlin">Forma Gallery Berlin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="field-label">Start Bounds</label>
                  <input type="date" defaultValue="2026-05-01" className="input-neumorph w-full text-[11px] font-bold" />
                </div>
                <div>
                  <label className="field-label">End Bounds</label>
                  <input type="date" defaultValue="2026-05-31" className="input-neumorph w-full text-[11px] font-bold" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4 mt-6 space-y-3">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              <span>Last Compile: 2026-05-24</span>
              <span>Outputs: CSV, PDF</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleGenerateReport(1, `${gallerySel} — Sales Export`, "CSV")}
                disabled={compilingCard !== null}
                className="btn-neumorph flex-1 text-xs font-bold py-2 flex items-center justify-center gap-1 disabled:opacity-40"
              >
                {compilingCard === 1 ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleGenerateReport(1, `${gallerySel} — Sales Export`, "PDF")}
                disabled={compilingCard !== null}
                className="btn-neumorph flex-1 text-xs font-bold py-2 flex items-center justify-center gap-1 disabled:opacity-40"
              >
                {compilingCard === 1 ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: ROYALTY SUMMARY */}
        <div className="card-neumorph p-5 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/5 pb-2">
              <Database className="w-5 h-5 text-[#1A3F6C]" />
              <span className="text-xs font-black text-[#1A3F6C] uppercase tracking-wider">
                Royalty Split Statement
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="field-label">Period Division</label>
                <select
                  value={royaltyPeriod}
                  onChange={(e) => setRoyaltyPeriod(e.target.value)}
                  className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                >
                  <option value="Q1 2026">First Quarter Q1 2026</option>
                  <option value="Q2 2026">Second Quarter Q2 2026</option>
                  <option value="Full Year 2025">Complete Statement FY2025</option>
                </select>
              </div>

              <div className="card-neumorph p-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-black/[0.01]">
                <span className="field-label mb-1 text-slate-700">Scope Parameters</span>
                Includes all blockchain split splits matching deployed verifier schemas.
              </div>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4 mt-6 space-y-3">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              <span>Last Compile: Never</span>
              <span>Outputs: CSV</span>
            </div>

            <button
              onClick={() => handleGenerateReport(2, `Royalty Statement ${royaltyPeriod}`, "CSV")}
              disabled={compilingCard !== null}
              className="btn-neumorph w-full text-xs font-black uppercase py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {compilingCard === 2 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Compile Statement</span>
            </button>
          </div>
        </div>

        {/* CARD 3: AUDIT TRAIL EXPORTER */}
        <div className="card-neumorph p-5 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/5 pb-2">
              <Filter className="w-5 h-5 text-[#1A3F6C]" />
              <span className="text-xs font-black text-[#1A3F6C] uppercase tracking-wider">
                Audit Trail Exporter
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="field-label">Audit Actor Scope</label>
                <select
                  value={auditScope}
                  onChange={(e) => setAuditScope(e.target.value)}
                  className="input-neumorph w-full text-xs font-bold uppercase tracking-wider py-1.5"
                >
                  <option value="ALL_ADMINS">All Administrative seat Actions</option>
                  <option value="Adaeze Nwosu">Adaeze Nwosu Only</option>
                  <option value="SYSTEM">Natively Triggered System Logs</option>
                </select>
              </div>

              <div className="card-neumorph p-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-black/[0.01]">
                <span className="field-label mb-1 text-slate-700">Security Credentials</span>
                Exports carry secure cryptographical hash commitments for ledger validation checks.
              </div>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4 mt-6 space-y-3">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              <span>Last Compile: 2026-05-25</span>
              <span>Outputs: CSV</span>
            </div>

            <button
              onClick={() => handleGenerateReport(3, `Audit Log Exporter [${auditScope}]`, "CSV")}
              disabled={compilingCard !== null}
              className="btn-neumorph w-full text-xs font-black uppercase py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {compilingCard === 3 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* History panel */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#1A3F6C] flex items-center gap-2">
          <History className="w-4 h-4" />
          Recent Generated Statements & Exports
        </h3>

        <div className="card-neumorph p-4">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse font-semibold">
              <thead>
                <tr className="border-b border-[#1A3F6C]/15">
                  <th className="px-4 py-3 text-[#1A3F6C]/70 uppercase font-bold">Report Profile Name</th>
                  <th className="px-4 py-3 text-[#1A3F6C]/70 uppercase font-bold">Format</th>
                  <th className="px-4 py-3 text-[#1A3F6C]/70 uppercase font-bold">Generated Timestamp</th>
                  <th className="px-4 py-3 text-[#1A3F6C]/70 uppercase font-bold">Size</th>
                  <th className="px-4 py-3 text-[#1A3F6C]/70 uppercase font-bold">Status</th>
                  <th className="px-4 py-3 text-[#1A3F6C]/70 uppercase font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {history.map((item) => (
                  <tr key={item.id} className="table-row-hover transition-colors">
                    <td className="px-4 py-3 font-extrabold text-[#11181c]">{item.reportName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`status-badge text-[9px] ${
                          item.format === "PDF"
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {item.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-bold">{item.timestamp}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{item.size}</td>
                    <td className="px-4 py-3 text-green-700 font-bold flex items-center gap-1 py-3">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      READY
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => alert(`Downloading payload file ${item.id}...`)}
                        className="btn-neumorph py-1 px-3 text-[10px] font-black uppercase"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
