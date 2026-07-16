"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { NeftwerkImage } from "@/components/NeftwerkImage";

type Params = { id: string };

export default function DiscoverArtworkPage({
  params,
}: {
  params: Params;
}) {
  const { id } = params;
  const [menuOpen, setMenuOpen] = useState(false);

  // Hardcode data for Fancy Free for the screenshots if id="1", else placeholders
  const title = id === "1" ? "Fancy Free" : "Artwork Title";
  const artist = id === "1" ? "Veronica Ceci" : "Unknown Artist";
  const imageUrl = id === "1" ? "/images/fav14.png" : `https://picsum.photos/seed/discover-${id}/700/520`;

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
            fit="contain"
            className="mx-auto max-w-full max-h-[min(70dvh,calc(100dvh-13rem))] bg-[#f4f2ef]"
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
            <span className="text-[20px] font-medium text-[#1A3F6C] mt-1">2345</span>
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
          Sponsored by nonprofit ATX Interfaces, this piece is a spontaneous mutual aid sculpture. It is stocked with quality items, wheeled out into the community and things are given out free of charge to anyone who might benefit from them. Emphasis is placed on recipients having agency to make choices from a variety of options. Time is spent chatting with anyone who cares to. It is not meant to replace major services, but rather to meet people where they are and offer support in the moment.
        </p>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        <Link
          href="/discover-redirect"
          className="btn-neumorph w-[85%] pointer-events-auto"
        >
          Link to marketplace
        </Link>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
