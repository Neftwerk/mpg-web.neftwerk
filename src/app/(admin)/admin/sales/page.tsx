"use client";

import React, { useState } from "react";
import { Copy, Trash2, RefreshCw, ExternalLink, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface SaleData {
  id: string;
  artwork: string;
  gallery: string;
  price: number;
  claimStatus: "ACTIVE" | "REVOKED" | "CLAIMED";
  claimLink: string;
  provenanceState: "GENERATED" | "CONSUMED" | "BOUND";
  coinflowStatus: "PENDING" | "SETTLED" | "FAILED";
}

interface MintJob {
  id: string;
  artworkId: string;
  artworkTitle: string;
  collectorEmail: string;
  txHash?: string;
  status: "PENDING" | "PROCESSING" | "CONFIRMED" | "FAILED";
  errorMsg?: string;
}

const INITIAL_SALES: SaleData[] = [
  {
    id: "sale-01",
    artwork: "Chromatic Dissolution No. 4",
    gallery: "Meridian Contemporary",
    price: 450,
    claimStatus: "CLAIMED",
    claimLink: "https://neftwerk.com/claim/c-92841-a1",
    provenanceState: "BOUND",
    coinflowStatus: "SETTLED",
  },
  {
    id: "sale-02",
    artwork: "Still Life with Protocol",
    gallery: "Lagos Black Box",
    price: 620,
    claimStatus: "ACTIVE",
    claimLink: "https://neftwerk.com/claim/c-92841-b2",
    provenanceState: "GENERATED",
    coinflowStatus: "PENDING",
  },
  {
    id: "sale-03",
    artwork: "Sovereign Blue",
    gallery: "Meridian Contemporary",
    price: 380,
    claimStatus: "ACTIVE",
    claimLink: "https://neftwerk.com/claim/c-92841-c3",
    provenanceState: "GENERATED",
    coinflowStatus: "PENDING",
  },
  {
    id: "sale-04",
    artwork: "Erosion Study III",
    gallery: "Meridian Contemporary",
    price: 300,
    claimStatus: "REVOKED",
    claimLink: "https://neftwerk.com/claim/c-92841-d4",
    provenanceState: "CONSUMED",
    coinflowStatus: "FAILED",
  },
];

const INITIAL_MINTS: MintJob[] = [
  {
    id: "mint-701",
    artworkId: "art-1",
    artworkTitle: "Chromatic Dissolution No. 4",
    collectorEmail: "m***y@gmail.com",
    txHash: "0x819284...c9281a",
    status: "CONFIRMED",
  },
  {
    id: "mint-702",
    artworkId: "art-3",
    artworkTitle: "Sovereign Blue",
    collectorEmail: "l***a@yahoo.com",
    status: "PROCESSING",
  },
  {
    id: "mint-703",
    artworkId: "art-2",
    artworkTitle: "Still Life with Protocol",
    collectorEmail: "k***t@protonmail.ch",
    status: "PENDING",
  },
  {
    id: "mint-704",
    artworkId: "art-4",
    artworkTitle: "Erosion Study III",
    collectorEmail: "o***w@me.com",
    status: "FAILED",
    errorMsg: "Stellar Horizon Error: INSUFFICIENT_FUNDS_FOR_FEE",
  },
];

export default function PrimarySalesPage() {
  const [sales, setSales] = useState<SaleData[]>(INITIAL_SALES);
  const [mints, setMints] = useState<MintJob[]>(INITIAL_MINTS);

  // Actions
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert("Claim link copied to clipboard!");
  };

  const handleRevokeClaim = (saleId: string) => {
    if (confirm("Are you sure you want to revoke this claim link? The collector will no longer be able to claim.")) {
      setSales((prev) =>
        prev.map((s) => (s.id === saleId ? { ...s, claimStatus: "REVOKED" } : s))
      );
    }
  };

  const handleRetryMint = (mintId: string) => {
    // Simulate active minting transition
    setMints((prev) =>
      prev.map((m) =>
        m.id === mintId
          ? { ...m, status: "PROCESSING", errorMsg: undefined }
          : m
      )
    );

    setTimeout(() => {
      setMints((prev) =>
        prev.map((m) =>
          m.id === mintId
            ? {
                ...m,
                status: "CONFIRMED",
                txHash: "0x" + Math.random().toString(16).substring(2, 14) + "...f28a9b",
              }
            : m
        )
      );
      alert("Mint request successfully submitted and confirmed on-chain!");
    }, 2000);
  };

  const handleViewExplorer = (txHash: string) => {
    alert(`Redirecting to Stellar Explorer for Hash: ${txHash}`);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
          Primary Commerce & Mints
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
          Manage claim pipelines, fiat escrow clearances, and transaction queues
        </p>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        {/* LEFT PANEL: ACTIVE SALES (3 cols) */}
        <div className="xl:col-span-3 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1A3F6C]">
            Active Commercial Operations
          </h3>

          <div className="card-neumorph p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1A3F6C]/15">
                  <th className="px-3 py-3 font-bold uppercase text-[#1A3F6C]/70">Artwork Details</th>
                  <th className="px-3 py-3 font-bold uppercase text-[#1A3F6C]/70 text-right">Price</th>
                  <th className="px-3 py-3 font-bold uppercase text-[#1A3F6C]/70">Claim Link</th>
                  <th className="px-3 py-3 font-bold uppercase text-[#1A3F6C]/70">Provenance Secret</th>
                  <th className="px-3 py-3 font-bold uppercase text-[#1A3F6C]/70">Fiat Status</th>
                  <th className="px-3 py-3 font-bold uppercase text-[#1A3F6C]/70 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {sales.map((sale) => (
                  <tr key={sale.id} className="table-row-hover transition-colors">
                    <td className="px-3 py-4">
                      <span className="font-extrabold text-[#11181c] block uppercase tracking-wide">
                        {sale.artwork}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {sale.gallery}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right font-black text-[#1A3F6C]">
                      {sale.price} XLM
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`status-badge text-[9px] ${
                            sale.claimStatus === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : sale.claimStatus === "REVOKED"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {sale.claimStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      {/* 3-step inline Provenance secret lifecycle indicator */}
                      <div className="flex items-center gap-1">
                        <span
                          title="Secret Generated"
                          className={`w-2.5 h-2.5 ${
                            sale.provenanceState === "GENERATED" ||
                            sale.provenanceState === "CONSUMED" ||
                            sale.provenanceState === "BOUND"
                              ? "bg-[#1A3F6C]"
                              : "bg-black/10"
                          }`}
                        ></span>
                        <span className="text-[9px] font-bold text-slate-500">→</span>
                        <span
                          title="Secret Consumed"
                          className={`w-2.5 h-2.5 ${
                            sale.provenanceState === "CONSUMED" ||
                            sale.provenanceState === "BOUND"
                              ? "bg-[#1A3F6C]"
                              : "bg-black/10"
                          }`}
                        ></span>
                        <span className="text-[9px] font-bold text-slate-500">→</span>
                        <span
                          title="Bound to Token"
                          className={`w-2.5 h-2.5 ${
                            sale.provenanceState === "BOUND" ? "bg-[#1A3F6C]" : "bg-black/10"
                          }`}
                        ></span>
                      </div>
                      <span className="text-[8px] font-extrabold text-[#1A3F6C]/60 uppercase tracking-widest block mt-1">
                        {sale.provenanceState}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`status-badge text-[9px] ${
                          sale.coinflowStatus === "SETTLED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : sale.coinflowStatus === "PENDING"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-rose-100 text-rose-800 border-rose-200"
                        }`}
                      >
                        {sale.coinflowStatus}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyLink(sale.claimLink)}
                          disabled={sale.claimStatus === "REVOKED"}
                          className="btn-neumorph p-1.5 disabled:opacity-30"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRevokeClaim(sale.id)}
                          disabled={sale.claimStatus === "REVOKED" || sale.claimStatus === "CLAIMED"}
                          className="btn-neumorph p-1.5 text-red-700 disabled:opacity-30"
                          title="Revoke Claim"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL: MINT QUEUE (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1A3F6C]">
            Mint Pipeline Operations
          </h3>

          <div className="card-neumorph p-4 space-y-4">
            <div className="space-y-3">
              {mints.map((mint) => (
                <div key={mint.id} className="card-neumorph p-3 flex flex-col justify-between gap-2">
                  {/* Row 1: Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold block">
                        JOB ID: {mint.id} (ID: {mint.artworkId})
                      </span>
                      <h4 className="text-xs font-extrabold uppercase text-[#11181c] tracking-wide mt-0.5">
                        {mint.artworkTitle}
                      </h4>
                    </div>
                    <StatusBadge status={mint.status} variant="mint" />
                  </div>

                  {/* Row 2: Metadata */}
                  <div className="grid grid-cols-2 gap-2 border-t border-black/5 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[8px] font-extrabold tracking-widest mb-0.5">COLLECTOR:</span>
                      {mint.collectorEmail}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[8px] font-extrabold tracking-widest mb-0.5">LEDGER HASH:</span>
                      {mint.txHash ? (
                        <span className="font-mono lowercase font-semibold tracking-normal text-slate-700 block truncate">
                          {mint.txHash}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold block">Awaiting confirmation</span>
                      )}
                    </div>
                  </div>

                  {/* Error display if failed */}
                  {mint.status === "FAILED" && mint.errorMsg && (
                    <div className="bg-red-50 p-2 border border-red-200 flex items-start gap-1.5 text-red-800 text-[9px] font-bold uppercase tracking-wide">
                      <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <div>{mint.errorMsg}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 border-t border-black/5 pt-2">
                    {mint.status === "FAILED" && (
                      <button
                        onClick={() => handleRetryMint(mint.id)}
                        className="btn-neumorph text-[9px] font-black uppercase py-1 px-3 flex items-center gap-1 text-[#1A3F6C]"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Minting</span>
                      </button>
                    )}
                    {mint.status === "CONFIRMED" && mint.txHash && (
                      <button
                        onClick={() => handleViewExplorer(mint.txHash!)}
                        className="btn-neumorph text-[9px] font-black uppercase py-1 px-3 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Ledger</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
