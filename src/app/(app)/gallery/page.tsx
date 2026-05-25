"use client";

import Link from "next/link";
import { useState } from "react";
import { galleryItems } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { NeftwerkImage } from "@/components/NeftwerkImage";

export default function GalleryPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  /* Split gallery items into left/right columns to match the Figma layout */
  const leftItems = galleryItems.filter((_, i) => i % 2 === 0); // items 1, 3, 5
  const rightItems = galleryItems.filter((_, i) => i % 2 === 1); // items 2, 4

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Gallery" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Gallery</h1>
      </header>

      {/* Gallery — 2 column staggered grid matching Figma layout */}
      <div className="p-4 pb-36 mt-20 lg:mt-0 lg:pb-4">
        <div className="grid grid-cols-2 gap-3 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-3">
            {leftItems.map((item) => (
              <Link
                key={item.id}
                href={`/artwork/${item.id}`}
                className="block card-neumorph"
              >
                <NeftwerkImage
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

          {/* Right column */}
          <div className="flex flex-col gap-3">
            {rightItems.map((item) => (
              <Link
                key={item.id}
                href={`/artwork/${item.id}`}
                className="block card-neumorph"
              >
                <NeftwerkImage
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
        </div>
      </div>

      {/* Sticky View collections button — always visible at bottom */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <Link
          href="/collections"
          className="btn-neumorph px-10 pointer-events-auto"
        >
          View collections
        </Link>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
