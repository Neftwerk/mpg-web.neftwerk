"use client";

import Link from "next/link";
import { useState } from "react";
import { galleryItems } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function GalleryPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Gallery" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Gallery</h1>
      </header>

      {/* Masonry gallery — NO rounded borders, thin white card borders */}
      <div className="p-4 pb-44 lg:pb-4">
        <div className="columns-2 gap-3 space-y-3">
          {galleryItems.map((item) => (
            <Link
              key={item.id}
              href={`/artwork/${item.id}`}
              className="block break-inside-avoid bg-white border border-white/80 shadow-sm overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.caption}
                className="w-full object-cover"
              />
              <p className="px-2 py-2 text-[13px] font-medium text-[#11181c]">
                {item.caption}
              </p>
            </Link>
          ))}
        </div>

        {/* View collections button */}
        <div className="fixed bottom-[90px] left-1/2 z-30 flex -translate-x-1/2 justify-center lg:static lg:mt-6 lg:translate-x-0">
          <Link
            href="/collections"
            className="inline-flex whitespace-nowrap rounded-full bg-[#f0ece8] px-10 py-3.5 text-[15px] font-bold text-[#1A3F6C] shadow-[0_8px_20px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] active:scale-[0.98]"
          >
            View collections
          </Link>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
