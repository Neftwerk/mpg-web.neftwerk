"use client";

import React, { useState, useEffect, useRef } from "react";

interface NeftwerkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string; // Applied to parent wrapper to preserve figma layout, margins, aspect ratio
  imgClassName?: string; // Optional custom styling for the <img> itself
}

export function NeftwerkImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  ...props
}: NeftwerkImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already cached and loaded
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden rounded-none ${className}`}>
      {/* Super Simple Skeleton Loading State (Strictly sharp-edged, minimal) */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#e5e2dd] animate-pulse rounded-none flex items-center justify-center z-10">
          <span className="text-[10px] uppercase tracking-widest font-black text-[#1A3F6C]/20 select-none">
            Loading
          </span>
        </div>
      )}

      {/* Actual Image with no-lazy-loading defaults */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-150 ${imgClassName} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        // Pre-fetch priority by default for important artworks
        fetchPriority="high"
        // Avoid browser default lazy-load delay unless requested
        loading={props.loading || "eager"}
        {...props}
      />
    </div>
  );
}
