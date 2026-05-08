"use client";

import { useState } from "react";
import { walletAddress } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function WalletPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Wallet" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Wallet</h1>
      </header>

      {/* Content */}
      <div className="p-5 pb-28 lg:pb-4">
        {/* Select payment type */}
        <p className="text-sm text-slate-500 mb-2">Select payment type</p>
        <div className="relative mb-6">
          <select className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-[15px] font-medium text-[#11181c] outline-none focus:border-[#4D91A7] focus:ring-1 focus:ring-[#4D91A7]/20 pr-10">
            <option>My Pocket Gallery Wallet</option>
            <option>External Wallet</option>
          </select>
          {/* Dropdown chevron */}
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
          >
            <path d="M6 9l6 6 6-6" stroke="#1A3F6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Balance card */}
        <div className="bg-white border border-slate-200/60 rounded-lg p-6 text-center mb-2">
          <p className="text-sm text-slate-500 mb-2">Wallet balance</p>
          <h2 className="text-3xl font-bold text-[#1A3F6C] mb-4">USD$ 38,056</h2>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-[#4D91A7] font-medium truncate max-w-[280px]">
              {walletAddress}
            </p>
            <button
              type="button"
              className="flex-shrink-0 p-1 hover:bg-slate-100 rounded transition"
              aria-label="Copy address"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="#1A3F6C" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#1A3F6C" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Action buttons — pill shape with shadow/gradient bg like Figma */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            type="button"
            className="w-[85%] rounded-full bg-[#f0ece8] py-4 text-[15px] font-bold text-[#1A3F6C] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98]"
          >
            Link another wallet
          </button>
          <button
            type="button"
            className="w-[85%] rounded-full bg-[#f0ece8] py-4 text-[15px] font-bold text-[#1A3F6C] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98]"
          >
            Add credit card
          </button>
          <button
            type="button"
            className="w-[85%] rounded-full bg-[#f0ece8] py-4 text-[15px] font-bold text-[#1A3F6C] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98]"
          >
            Link bank account
          </button>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
