"use client";

import { useState } from "react";
import { walletAddress } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}

function WalletContent() {
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
      <div className="p-5 mt-20 lg:mt-0 pb-28 lg:pb-4">
        {/* Select payment type */}
        <p className="text-sm text-[#616161] mb-2">Select payment type</p>
        <div className="relative mb-6">
          <select className="w-full appearance-none bg-white border border-slate-200 px-4 py-3.5 text-[15px] font-medium text-[#11181c] outline-none focus:border-[#4D91A7] focus:ring-1 focus:ring-[#4D91A7]/20 pr-10">
            <option>My Pocket Gallery Wallet</option>
            <option>Credit card - 1234</option>
            <option>Bank - 6789</option>
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
        <div className="bg-white border border-[#BAC4C8] text-center py-6 px-4 mb-2">
          <p className="text-sm text-[#464646] mb-2">Wallet balance</p>
          <h2 className="text-[28px] font-bold text-[#1A3F6C] mb-5">USD$ 38,056</h2>
          <div className="flex items-center justify-center gap-3">
            <p className="text-sm text-[#1A3F6C] font-medium truncate max-w-[280px] underline underline-offset-2">
              {walletAddress}
            </p>
            <button
              type="button"
              className="flex-shrink-0 p-1 transition active:scale-95"
              aria-label="Copy address"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/copybutton.svg"
                alt="Copy"
                className="h-[20px] w-[20px]"
              />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-5 mt-8">
          <button type="button" className="btn-neumorph w-[85%]">
            Link another wallet
          </button>
          <button type="button" className="btn-neumorph w-[85%]">
            Add credit card
          </button>
          <button type="button" className="btn-neumorph w-[85%]">
            Link bank account
          </button>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
