"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function CollectionsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Collections" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Collections</h1>
      </header>

      <div className="p-4 pb-48 lg:pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* #Favorite Pieces */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">#Favorite Pieces</p>
            <div className="bg-white border border-white/80 shadow-sm p-1.5">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                {/* eslint-disable @next/next/no-img-element */}
                <img src="/images/fav1.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav3.png" alt="" className="w-full row-span-2 h-full object-cover" />
                <img src="/images/fav2.png" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* #Ones to watch */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">#Ones to watch</p>
            <div className="bg-white border border-white/80 shadow-sm p-1.5">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img src="/images/fav4.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav5.png" alt="" className="w-full row-span-2 h-full object-cover" />
                <img src="/images/fav6.png" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* #German artists */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">#German artists</p>
            <div className="bg-white border border-white/80 shadow-sm p-1.5">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img src="/images/fav7.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav8.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav9.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav10.png" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* #Female artists */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">#Female artists</p>
            <div className="bg-white border border-white/80 shadow-sm p-1.5">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img src="/images/fav11.png" alt="" className="w-full row-span-2 h-full object-cover" />
                <img src="/images/fav12.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav13.png" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* #Inspiration */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">#Inspiration</p>
            <div className="bg-white border border-white/80 shadow-sm p-1.5">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <img src="/images/fav1.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav7.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav9.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav4.png" alt="" className="w-full h-full object-cover" />
                {/* eslint-enable @next/next/no-img-element */}
              </div>
            </div>
          </div>

          {/* #Nostalgic */}
          <div>
            <p className="text-sm font-medium text-[#11181c] mb-2">#Nostalgic</p>
            <div className="bg-white border border-white/80 shadow-sm p-1.5">
              <div className="grid grid-cols-2 grid-rows-2 gap-1">
                {/* eslint-disable @next/next/no-img-element */}
                <img src="/images/fav2.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav5.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav8.png" alt="" className="w-full h-full object-cover" />
                <img src="/images/fav10.png" alt="" className="w-full h-full object-cover" />
                {/* eslint-enable @next/next/no-img-element */}
              </div>
            </div>
          </div>
        </div>

        {/* Create collection button */}
        <div className="fixed bottom-[86px] left-1/2 z-30 flex -translate-x-1/2 justify-center lg:static lg:mt-8 lg:translate-x-0">
          <Link
            href="/new-collection"
            className="inline-flex whitespace-nowrap rounded-full bg-[#f0ece8] px-10 py-3.5 text-[15px] font-bold text-[#1A3F6C] shadow-[0_8px_20px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] active:scale-[0.98]"
          >
            Create a new collection
          </Link>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
