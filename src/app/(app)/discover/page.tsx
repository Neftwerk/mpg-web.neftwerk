"use client";

import Link from "next/link";
import { useState } from "react";
import { discoverPopular } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function DiscoverPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Discover" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Discover</h1>
      </header>

      <div className="p-4 pb-28 lg:pb-4">
        {/* Search */}
        <input
          className="w-full border border-slate-300 bg-white px-4 py-3.5 text-[15px] placeholder:text-slate-400 outline-none transition focus:border-[#4D91A7] focus:ring-1 focus:ring-[#4D91A7]/20 mb-4"
          placeholder="Search anything"
        />

        {/* Popular items */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {discoverPopular.map((d) => (
            <Link
              key={d.id}
              href={`/discover-artwork/${d.id}`}
              className="bg-white border border-white/80 shadow-sm overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.imageUrl} alt={d.title} className="w-full object-cover" />
              <p className="px-2 py-2 text-[13px] font-medium text-[#11181c]">{d.title}</p>
            </Link>
          ))}
        </div>

        {/* Linked marketplaces */}
        <Link
          className="block bg-white border border-white/80 shadow-sm p-4"
          href="/discover-redirect"
        >
          <h3 className="text-lg font-semibold text-[#1A3F6C]">Linked marketplaces</h3>
          <p className="mt-2 text-sm text-slate-500">OpenSea, Foundation, SuperRare</p>
        </Link>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
