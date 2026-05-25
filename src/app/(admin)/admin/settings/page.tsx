"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sliders, Timer, Shield, Key, AlertTriangle, Globe } from "lucide-react";

interface ApiKeyRow {
  name: string;
  hash: string;
  created: string;
  lastUsed: string;
}

export default function SettingsPage() {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    flags: true,
    claim: true,
    banner: false,
    keys: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Settings State
  const [flags, setFlags] = useState({
    zkMint: true,
    commentsOpen: true,
    primarySalesActive: true,
    multisigOnboarding: false,
  });

  const [claimTtl, setClaimTtl] = useState(72); // hours
  const [supportedCountries, setSupportedCountries] = useState("NG, DE, KR, US, GB, ZA");

  const [maintenance, setMaintenance] = useState({
    enabled: false,
    bannerText: "System undergoing Scheduled Stellar ledger maintenance nodes upgrades. Minting may encounter delays.",
  });

  const apiKeys: ApiKeyRow[] = [
    {
      name: "Stellar Horizon Anchor Gateway",
      hash: "sha256: 8a91c29b4...8b21a8",
      created: "2026-01-10",
      lastUsed: "2 mins ago",
    },
    {
      name: "Coinflow Settlement Gateway",
      hash: "sha256: d829bf81a...92cf99",
      created: "2026-02-14",
      lastUsed: "10 mins ago",
    },
    {
      name: "IPFS Infura Node Provider",
      hash: "sha256: c928a49c2...772a81",
      created: "2026-01-10",
      lastUsed: "1 hour ago",
    },
  ];

  const handleSaveSettings = (section: string) => {
    alert(`Configuration parameters for ${section.toUpperCase()} saved successfully! Dispatched state update to ledger.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-[#11181c] uppercase tracking-wider">
          System Control Panel
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1A3F6C]/70">
          Adjust global features, configure secure API keys, and manage node maintenance flags
        </p>
      </div>

      {/* SECTION 1: FEATURE FLAGS (COLLAPSIBLE) */}
      <div className="card-neumorph overflow-hidden transition-all duration-200">
        <button
          onClick={() => toggleSection("flags")}
          className="w-full p-5 flex items-center justify-between text-left border-radius-0 focus:outline-none hover:bg-black/[0.01]"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1A3F6C]" />
            <h3 className="text-sm font-black uppercase text-[#1A3F6C] tracking-widest">
              Nodule Feature Flags
            </h3>
          </div>
          {openSections.flags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.flags && (
          <div className="px-6 pb-6 border-t border-black/5 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 card-neumorph bg-black/[0.01] cursor-pointer">
                <div>
                  <span className="text-xs font-black uppercase text-[#11181c] tracking-wider block">
                    Zero-Knowledge Minting
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Encrypt ownership mappings.</span>
                </div>
                <input
                  type="checkbox"
                  checked={flags.zkMint}
                  onChange={(e) => setFlags((prev) => ({ ...prev, zkMint: e.target.checked }))}
                  className="w-4 h-4 accent-[#1A3F6C]"
                />
              </label>

              <label className="flex items-center justify-between p-3 card-neumorph bg-black/[0.01] cursor-pointer">
                <div>
                  <span className="text-xs font-black uppercase text-[#11181c] tracking-wider block">
                    Forum Comments Open
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Enable collector text submissions.</span>
                </div>
                <input
                  type="checkbox"
                  checked={flags.commentsOpen}
                  onChange={(e) => setFlags((prev) => ({ ...prev, commentsOpen: e.target.checked }))}
                  className="w-4 h-4 accent-[#1A3F6C]"
                />
              </label>

              <label className="flex items-center justify-between p-3 card-neumorph bg-black/[0.01] cursor-pointer">
                <div>
                  <span className="text-xs font-black uppercase text-[#11181c] tracking-wider block">
                    Primary Sales Active
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Activate drop checkout modules.</span>
                </div>
                <input
                  type="checkbox"
                  checked={flags.primarySalesActive}
                  onChange={(e) => setFlags((prev) => ({ ...prev, primarySalesActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#1A3F6C]"
                />
              </label>

              <label className="flex items-center justify-between p-3 card-neumorph bg-black/[0.01] cursor-pointer">
                <div>
                  <span className="text-xs font-black uppercase text-[#11181c] tracking-wider block">
                    Multisig Onboarding Gates
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Require double approver signs.</span>
                </div>
                <input
                  type="checkbox"
                  checked={flags.multisigOnboarding}
                  onChange={(e) => setFlags((prev) => ({ ...prev, multisigOnboarding: e.target.checked }))}
                  className="w-4 h-4 accent-[#1A3F6C]"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2 border-t border-black/5 mt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings("flags")}
                className="btn-neumorph py-1.5 px-4 text-xs font-black uppercase tracking-wider bg-[#1A3F6C] text-[#f5f0ec]"
              >
                Save Flags State
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: CLAIM LINK & COMPLIANCE CONFIG (COLLAPSIBLE) */}
      <div className="card-neumorph overflow-hidden transition-all duration-200">
        <button
          onClick={() => toggleSection("claim")}
          className="w-full p-5 flex items-center justify-between text-left border-radius-0 focus:outline-none hover:bg-black/[0.01]"
        >
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#1A3F6C]" />
            <h3 className="text-sm font-black uppercase text-[#1A3F6C] tracking-widest">
              Claim Configurations
            </h3>
          </div>
          {openSections.claim ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.claim && (
          <div className="px-6 pb-6 border-t border-black/5 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="field-label">Claim Link TTL (Hours)</label>
                <input
                  type="number"
                  value={claimTtl}
                  onChange={(e) => setClaimTtl(Number(e.target.value))}
                  min={1}
                  className="input-neumorph w-full text-xs font-bold"
                />
                <span className="text-[9px] font-bold text-[#1A3F6C]/60 block mt-1 uppercase">
                  Time-To-Live limits for dynamic purchase claim links.
                </span>
              </div>

              <div>
                <label className="field-label flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  Supported Country Codes
                </label>
                <input
                  type="text"
                  value={supportedCountries}
                  onChange={(e) => setSupportedCountries(e.target.value)}
                  placeholder="NG, DE, US"
                  className="input-neumorph w-full text-xs font-bold font-mono"
                />
                <span className="text-[9px] font-bold text-[#1A3F6C]/60 block mt-1 uppercase">
                  Restricted country gates for fiat settlement checkout.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-black/5 mt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings("claim")}
                className="btn-neumorph py-1.5 px-4 text-xs font-black uppercase bg-[#1A3F6C] text-[#f5f0ec]"
              >
                Save Configurations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: MAINTENANCE BANNER (COLLAPSIBLE) */}
      <div className="card-neumorph overflow-hidden transition-all duration-200">
        <button
          onClick={() => toggleSection("banner")}
          className="w-full p-5 flex items-center justify-between text-left border-radius-0 focus:outline-none hover:bg-black/[0.01]"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#1A3F6C]" />
            <h3 className="text-sm font-black uppercase text-[#1A3F6C] tracking-widest">
              Emergency Maintenance banner
            </h3>
          </div>
          {openSections.banner ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.banner && (
          <div className="px-6 pb-6 border-t border-black/5 pt-4 space-y-4">
            <div className="flex items-center justify-between p-3 card-neumorph bg-black/[0.01] mb-2">
              <div>
                <span className="text-xs font-black uppercase text-[#11181c] tracking-wider block">
                  Broadcast Public Banner
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Publish a global message on checkout drop pages.</span>
              </div>
              <input
                type="checkbox"
                checked={maintenance.enabled}
                onChange={(e) => setMaintenance((prev) => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 accent-[#1A3F6C]"
              />
            </div>

            <div>
              <label className="field-label">Banner Broadcast Text</label>
              <textarea
                value={maintenance.bannerText}
                onChange={(e) => setMaintenance((prev) => ({ ...prev, bannerText: e.target.value }))}
                rows={2}
                disabled={!maintenance.enabled}
                className="input-neumorph w-full text-xs font-bold disabled:opacity-40"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-black/5 mt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings("banner")}
                className="btn-neumorph py-1.5 px-4 text-xs font-black uppercase bg-[#1A3F6C] text-[#f5f0ec]"
              >
                Deploy Banner State
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: API CREDENTIALS (COLLAPSIBLE) */}
      <div className="card-neumorph overflow-hidden transition-all duration-200">
        <button
          onClick={() => toggleSection("keys")}
          className="w-full p-5 flex items-center justify-between text-left border-radius-0 focus:outline-none hover:bg-black/[0.01]"
        >
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#1A3F6C]" />
            <h3 className="text-sm font-black uppercase text-[#1A3F6C] tracking-widest">
              Secure API Gateway Keys
            </h3>
          </div>
          {openSections.keys ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.keys && (
          <div className="px-6 pb-6 border-t border-black/5 pt-4 space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Encrypted API Keys - Read-Only hashes. Key values cannot be unmasked in public UI.
            </span>

            <div className="card-neumorph overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-semibold">
                <thead>
                  <tr className="border-b border-[#1A3F6C]/15 bg-black/5">
                    <th className="px-4 py-2 text-[#1A3F6C]/70 uppercase font-bold">Key Profile Mapping</th>
                    <th className="px-4 py-2 text-[#1A3F6C]/70 uppercase font-bold">SHA256 Encrypted Prefix</th>
                    <th className="px-4 py-2 text-[#1A3F6C]/70 uppercase font-bold">Generated</th>
                    <th className="px-4 py-2 text-[#1A3F6C]/70 uppercase font-bold text-right">Last Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-[#f5f0ec]">
                  {apiKeys.map((key, idx) => (
                    <tr key={idx} className="table-row-hover transition-colors">
                      <td className="px-4 py-3 font-extrabold text-[#11181c]">{key.name}</td>
                      <td className="px-4 py-3">
                        <code className="text-[10px] font-mono font-bold text-slate-700 bg-black/5 p-1 rounded-none">
                          {key.hash}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-bold">{key.created}</td>
                      <td className="px-4 py-3 text-slate-500 font-bold text-right">{key.lastUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-black/5 mt-4">
              <button
                type="button"
                onClick={() => {
                  const keyName = prompt("Enter descriptive profile name for new API Key:");
                  if (keyName) {
                    alert(`API Gateway configured for "${keyName}". Copy private token: NTWK_SECRET_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
                  }
                }}
                className="btn-neumorph py-1.5 px-4 text-xs font-black uppercase bg-[#1A3F6C] text-[#f5f0ec]"
              >
                Provision API Key
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
