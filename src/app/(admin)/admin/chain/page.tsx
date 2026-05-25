"use client";

import React from "react";
import { Cpu, Copy, Check, Server, Landmark, ShieldCheck, RefreshCw } from "lucide-react";

export default function ChainContractsPage() {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const contracts = {
    arts1Address: "CDKLP5NZYMF3VCFKJFVH2H3RJVMCXBKHQMFJTQAHLZ6DTQZVBWQO5ARTS",
    verifierAddress: "CCKFBEIYTKP3BPNM5Y72YOILXDGJ6ZV2IUCWQXQ7J3WYVZPQJM4Y3VERI",
    zkCommitment: "0x3b8921df...77a819bafbeaa3f62",
    lastBlock: "59,284,104",
    lastSync: "12 seconds ago",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
          Chain & Contract Registry
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
          Monitor native Stellar smart contracts and verified ZK state histories
        </p>
      </div>

      {/* Network Health Banner */}
      <div className="card-neumorph p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A3F6C]/10 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-[#1A3F6C]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1A3F6C]">
              Ledger Synced Node Status
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-none animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#11181c]">
                Horizon Node Synced & Stable
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <div>
            <span className="text-slate-400 text-[8px] font-extrabold tracking-widest block mb-0.5">LAST SYNCED BLOCK:</span>
            <span className="font-mono text-slate-800 font-extrabold">{contracts.lastBlock}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[8px] font-extrabold tracking-widest block mb-0.5">LATEST DELAY:</span>
            <span className="text-slate-800 font-extrabold flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-[#1A3F6C] animate-spin" />
              {contracts.lastSync}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Cards layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Network Environment */}
        <div className="card-neumorph p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-2">
            <span className="text-xs font-black text-[#1A3F6C] uppercase tracking-wider">
              Network Layer
            </span>
            <span className="status-badge bg-amber-100 text-amber-800 border border-amber-200">
              STELLAR TESTNET
            </span>
          </div>
          <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <div className="flex justify-between">
              <span>Passphrase:</span>
              <span className="font-mono lowercase tracking-normal text-[#11181c]">Test SDF Network ; September 2015</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Mode:</span>
              <span className="text-[#11181c]">Full Archive RPC</span>
            </div>
            <div className="flex justify-between">
              <span>Ledger Version:</span>
              <span className="text-[#11181c]">v21.1.0-rc3</span>
            </div>
          </div>
        </div>

        {/* Card 2: ZK Commitment Spec */}
        <div className="card-neumorph p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-2">
            <span className="text-xs font-black text-[#1A3F6C] uppercase tracking-wider">
              ZK Commitment Core
            </span>
            <ShieldCheck className="w-4 h-4 text-green-700" />
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-[8px] font-extrabold tracking-widest block mb-1">CURRENT ROOT COMMITMENT:</span>
              <code className="text-xs font-mono font-bold text-[#11181c] bg-black/5 p-2 block truncate">
                {contracts.zkCommitment}
              </code>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              <span>Schema: Groth16 Snark</span>
              <span>Verification keys: Embedded</span>
            </div>
          </div>
        </div>

        {/* Card 3: ARTS-1 Token Contract */}
        <div className="card-neumorph p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-2">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#1A3F6C]" />
              <span className="text-xs font-black text-[#1A3F6C] uppercase tracking-wider">
                ARTS-1 Token Registry
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A3F6C]/60 bg-[#1A3F6C]/10 px-2 py-0.5">
              Active Contract
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 font-medium">
              Governs standard token mints, metadata pointers, and royalty split records on the ledger.
            </p>
            <div className="relative">
              <code className="text-[10px] font-mono font-bold text-[#11181c] bg-black/5 p-3 pr-10 block truncate select-all">
                {contracts.arts1Address}
              </code>
              <button
                onClick={() => handleCopy(contracts.arts1Address, "arts1")}
                className="absolute right-2 top-1.5 p-1 bg-[#f5f0ec] hover:bg-black/5 btn-neumorph border border-black/5"
              >
                {copiedText === "arts1" ? (
                  <Check className="w-3.5 h-3.5 text-green-700" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Verifier Contract */}
        <div className="card-neumorph p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-2">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-[#1A3F6C]" />
              <span className="text-xs font-black text-[#1A3F6C] uppercase tracking-wider">
                ZK Verifier Contract
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A3F6C]/60 bg-[#1A3F6C]/10 px-2 py-0.5">
              Active Verifier
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 font-medium">
              Evaluates zero-knowledge parameter validity during the claim-to-mint transition pipeline.
            </p>
            <div className="relative">
              <code className="text-[10px] font-mono font-bold text-[#11181c] bg-black/5 p-3 pr-10 block truncate select-all">
                {contracts.verifierAddress}
              </code>
              <button
                onClick={() => handleCopy(contracts.verifierAddress, "verifier")}
                className="absolute right-2 top-1.5 p-1 bg-[#f5f0ec] hover:bg-black/5 btn-neumorph border border-black/5"
              >
                {copiedText === "verifier" ? (
                  <Check className="w-3.5 h-3.5 text-green-700" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Advisory note */}
      <div className="bg-[#1A3F6C]/5 p-4 border border-[#1A3F6C]/15 text-xs font-medium text-slate-600">
        <span className="font-extrabold uppercase text-[#1A3F6C] block mb-1">Immutable Architecture Notice</span>
        All parameters listed in this registry represent verified, deployed ledger state mappings. Deactivation, registry modifications, or new contract insertions must undergo multi-signature transaction clearances by elected Super Administrators.
      </div>
    </div>
  );
}
