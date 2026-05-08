"use client";

import { useState } from "react";
import { use } from "react";
import { galleryItems } from "@/lib/content";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

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
      <MobileTopBar title="Artwork Details" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Artwork Details</h1>
      </header>

      <div className="p-4 pb-28 lg:pb-4">
        <div className="bg-white border border-slate-200/60 p-4">
          {/* Artwork image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full aspect-[4/3] object-cover"
          />

          {/* Title */}
          <h2 className="mt-4 text-lg font-semibold text-[#1A3F6C]">{title}</h2>

          {/* Artist */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/user.png"
                alt={artist}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <p className="text-sm font-semibold text-[#11181c]">{artist}</p>
          </div>

          {/* Description */}
          <h3 className="mt-4 text-base font-semibold text-[#4D91A7] italic">
            Description
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>

          {/* Add to collection button */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full !rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition hover:bg-slate-50"
            >
              Add to collection
            </button>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
