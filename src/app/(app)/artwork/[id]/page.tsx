"use client";

import { useState } from "react";
import { use } from "react";
import { galleryItems } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { NeftwerkImage } from "@/components/NeftwerkImage";

type Params = { id: string };

export default function ArtworkPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const [menuOpen, setMenuOpen] = useState(false);

  const artwork = galleryItems.find((g) => g.id === id);
  const title = artwork?.caption ?? `Artwork #${id}`;
  const artist = artwork?.artist ?? "Unknown Artist";
  const description = artwork?.description ?? "This piece reimagines a familiar motif through contemporary materials and scale.";
  const imageUrl = artwork?.imageUrl ?? `/images/art1.png`;

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Artwork Details" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4 mt-20 lg:mt-0">
        <h1 className="text-xl font-semibold text-slate-900">Artwork Details</h1>
      </header>

      <div className="p-5 pb-36 mt-20 lg:mt-0">
        {/* Artwork Image Container */}
        <div className="card-neumorph p-3 bg-white mb-6">
          <NeftwerkImage
            src={imageUrl}
            alt={title}
            className="w-full object-cover aspect-[4/3]"
            onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/fallback/800/600" }}
          />
        </div>

        {/* Title */}
        <h2 className="text-[19px] font-bold text-[#1A3F6C] mb-4">
          {title}
        </h2>

        {/* Artist */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[46px] w-[46px] rounded-full border-[2px] border-[#38A8AB] overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/default-avatar.svg"
              alt={artist}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-[16px] font-semibold text-[#11161C]">{artist}</p>
        </div>

        {/* Token Details Box */}
        <div className="bg-[#F8FAFB] border border-[#BAC4C8] p-5 mb-6 flex items-center justify-between">
          <div className="flex flex-col items-start gap-1 flex-[0.8]">
            <span className="text-[14px] text-[#464646]">Token ID</span>
            <span className="text-[20px] font-medium text-[#1A3F6C] mt-1">1902</span>
          </div>
          <div className="h-12 w-px bg-[#BAC4C8] opacity-60" />
          <div className="flex flex-col items-start gap-1 flex-1 pl-4">
            <span className="text-[14px] text-[#464646] leading-tight">Token<br/>standard</span>
            <span className="text-[20px] font-medium text-[#1A3F6C]">ERC 721</span>
          </div>
          <div className="h-12 w-px bg-[#BAC4C8] opacity-60" />
          <div className="flex flex-col items-end gap-1 flex-[0.8]">
            <span className="text-[14px] text-[#464646]">Blockchain</span>
            <span className="text-[20px] font-medium text-[#1A3F6C] mt-1">ETH</span>
          </div>
        </div>

        {/* Description */}
        <h3 className="text-[17px] font-medium text-[#1A3F6C] mb-3">
          Description
        </h3>
        <p className="text-[15px] leading-[1.6] text-[#464646] mb-8">
          {description}
        </p>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          className="btn-neumorph w-[85%] pointer-events-auto"
        >
          Add to collection
        </button>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
