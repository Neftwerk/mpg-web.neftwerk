"use client";

import React, { useState } from "react";
import { Edit2, ExternalLink } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { NeftwerkImage } from "../NeftwerkImage";

export interface ArtworkData {
  id: string;
  title: string;
  artist: string;
  collection: string;
  status: "DRAFT" | "READY" | "LISTED" | "MINTED";
  listPrice: number; // in XLM
  royaltyBps: number; // 0 - 10000 (basis points)
  payoutAddress: string;
  metadataCid?: string;
  description: string;
  imageUrl: string;
}

interface ArtworkCardProps {
  artwork: ArtworkData;
  onEdit: (artwork: ArtworkData) => void;
  onViewOnChain?: (artwork: ArtworkData) => void;
}

export function ArtworkCard({ artwork, onEdit, onViewOnChain }: ArtworkCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card-neumorph flex flex-col justify-between overflow-hidden relative group min-h-[300px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Aspect Ratio 4:3 Image Container */}
      <div className="relative w-full aspect-[4/3] bg-black/5 overflow-hidden">
        <NeftwerkImage
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Dynamic Overlay Actions on Hover */}
        {hovered && (
          <div className="absolute inset-0 bg-[#f5f0ec]/90 flex items-center justify-center gap-3 p-4 transition-all duration-200">
            <button
              onClick={() => onEdit(artwork)}
              className="btn-neumorph py-1.5 px-3 text-xs flex items-center gap-1 font-bold uppercase tracking-wider bg-[#1A3F6C] text-[#f5f0ec]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            {artwork.status === "MINTED" && onViewOnChain && (
              <button
                onClick={() => onViewOnChain(artwork)}
                className="btn-neumorph py-1.5 px-3 text-xs flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>On-Chain</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          {/* Header row: Status and price */}
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={artwork.status} variant="artwork" />
            <span className="text-xs font-black text-[#1A3F6C]">
              {artwork.listPrice} XLM
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-black text-[#11181c] truncate pt-1 uppercase tracking-wide">
            {artwork.title}
          </h4>

          {/* Artist */}
          <span className="text-xs text-[#11181c]/70 font-semibold block uppercase tracking-wider">
            by {artwork.artist}
          </span>
        </div>

        {/* Footer: Collection and Artwork ID */}
        <div className="border-t border-black/5 mt-3 pt-3 flex flex-col gap-1 text-[10px] font-bold text-[#1A3F6C]/60 uppercase tracking-widest leading-none">
          <div className="truncate">
            <span className="text-[#1A3F6C]/40">Collection:</span> {artwork.collection}
          </div>
          <code className="text-[9px] font-mono lowercase font-bold tracking-normal text-slate-500 mt-1 block">
            id: {artwork.id}
          </code>
        </div>
      </div>
    </div>
  );
}
