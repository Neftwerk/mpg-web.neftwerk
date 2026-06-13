"use client";

import React, { useState, useEffect, useRef } from "react";

interface NeftwerkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Hero / above-the-fold images — eager load with high fetch priority. */
  priority?: boolean;
}

export function NeftwerkImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  loading,
  fetchPriority,
  ...props
}: NeftwerkImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  const resolvedFetchPriority = fetchPriority ?? (priority ? "high" : "auto");

  return (
    <div className={`relative overflow-hidden rounded-none ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[#e0ddd8] animate-pulse rounded-none z-10" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-150 ${imgClassName} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        loading={resolvedLoading}
        fetchPriority={resolvedFetchPriority}
        decoding="async"
        {...props}
      />
    </div>
  );
}
