"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { isPresignedMediaUrl, resolveStorageUrl } from "@/lib/storage-service";

interface NeftwerkImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Hero / above-the-fold images — eager load with high fetch priority. */
  priority?: boolean;
}

function imageAlreadyLoaded(img: HTMLImageElement | null): boolean {
  return Boolean(img?.complete && img.naturalWidth > 0);
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
  const initialSrc = src && isPresignedMediaUrl(src) ? src : src;
  const [loaded, setLoaded] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(initialSrc);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    if (imageAlreadyLoaded(imgRef.current)) {
      setLoaded(true);
    }
  }, [resolvedSrc]);

  useEffect(() => {
    let cancelled = false;

    if (!src) {
      setResolvedSrc("");
      setLoaded(false);
      return;
    }

    if (isPresignedMediaUrl(src)) {
      setResolvedSrc(src);
      return;
    }

    setLoaded(false);
    setResolvedSrc(src);

    void resolveStorageUrl(src).then((url) => {
      if (!cancelled) setResolvedSrc(url);
    });

    return () => {
      cancelled = true;
    };
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
        src={resolvedSrc}
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
