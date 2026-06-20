"use client";

import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function MessagesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileTopBar title="Messages" onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
      </header>

      <div className="p-5 mt-20 lg:mt-0 pb-28 lg:pb-4 flex items-center justify-center min-h-[60dvh]">
        <div className="card-neumorph w-full max-w-md p-8 text-center space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4D91A7]">
            Coming soon
          </p>
          <h2 className="text-xl font-semibold text-[#11181c]">
            Messages is under development
          </h2>
          <p className="text-sm text-[#616161] leading-relaxed">
            We are building direct messaging, collector conversations, and
            notifications. Check back soon.
          </p>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
