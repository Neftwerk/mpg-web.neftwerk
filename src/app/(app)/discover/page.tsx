"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function DiscoverPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Discover" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4 mt-20 lg:mt-0">
        <h1 className="text-xl font-semibold text-slate-900">Discover</h1>
      </header>

      <div className="p-4 pb-28 lg:pb-4 mt-20 lg:mt-0">
        {/* Search */}
        <div className="relative mb-8">
          <input
            className="w-full rounded-[10px] border border-slate-200 bg-white/60 pl-4 pr-10 py-3 text-[15px] placeholder:text-[#888] outline-none transition focus:border-[#4D91A7] focus:ring-1 focus:ring-[#4D91A7]/20 shadow-sm"
            placeholder="Search anything"
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Popular artworks */}
        <h3 className="text-[16px] font-bold text-[#1A3F6C] mb-3">Popular artworks</h3>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Link href="/discover-artwork/1" className="card-neumorph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/fav14.png" alt="Fancy Free" className="w-full aspect-square object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/pop1/400/400" }} />
            <p className="px-1 py-2 text-[11px] font-medium text-[#464646] truncate">Fancy Free</p>
          </Link>
          <Link href="/discover-artwork/2" className="card-neumorph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/fav15.png" alt="Totem #13" className="w-full aspect-square object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/pop2/400/400" }} />
            <p className="px-1 py-2 text-[11px] font-medium text-[#464646] truncate">Totem #13</p>
          </Link>
          <Link href="/discover-artwork/3" className="card-neumorph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/art2.png" alt="Ashley" className="w-full aspect-square object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/pop3/400/400" }} />
            <p className="px-1 py-2 text-[11px] font-medium text-[#464646] truncate">Ashley</p>
          </Link>
        </div>

        {/* Discover new works */}
        <h3 className="text-[16px] font-bold text-[#1A3F6C] mb-3">Discover new works</h3>
        <div className="mb-8">
          <Link href="/discover-artwork/4" className="block card-neumorph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/discover.png" alt="Do not turn this artwork into a NFT" className="w-full object-cover aspect-[2/1]" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/nft/800/400" }} />
            <p className="px-2 py-2 text-[13px] font-medium text-[#464646]">Do not turn this artwork into a NFT</p>
          </Link>
        </div>

        {/* Linked marketplaces */}
        <h3 className="text-[16px] font-bold text-[#1A3F6C] mb-3">Linked marketplaces</h3>
        <div className="flex flex-col gap-3">
          <Link href="/discover-artwork/5" className="block card-neumorph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/fav18.png" alt="FUtility III" className="w-full object-cover aspect-[2/1]" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/futility/800/400" }} />
            <p className="px-2 py-2 text-[13px] font-medium text-[#464646]">FUtility III</p>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/discover-artwork/6" className="card-neumorph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/art3.png" alt="Womb Hole #8" className="w-full aspect-[4/3] object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/womb/400/300" }} />
            </Link>
            <Link href="/discover-artwork/7" className="card-neumorph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/art1.png" alt="Girl with a pearl earring" className="w-full aspect-[4/3] object-cover" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/girl/400/300" }} />
            </Link>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
