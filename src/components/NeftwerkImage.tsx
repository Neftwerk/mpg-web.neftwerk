"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { isPresignedMediaUrl, resolveStorageUrl } from "@/lib/storage-service";

export type NeftwerkImageFit = "natural" | "contain" | "cover";

interface NeftwerkImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "width" | "height"
> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /**
   * How the image fills its box:
   * - natural: scale to width, height follows intrinsic aspect (masonry / cards)
   * - contain: full image visible inside the box (detail views)
   * - cover: crop to fill — only for approved non-artwork UI (avatars, tiny thumbs)
   */
  fit?: NeftwerkImageFit;
  /** Intrinsic pixel width — reserves layout space and prevents CLS. */
  width?: number;
  /** Intrinsic pixel height — reserves layout space and prevents CLS. */
  height?: number;
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
  fit = "natural",
  width,
  height,
  priority = false,
  loading,
  fetchPriority,
  style,
  onLoad: onLoadProp,
  ...props
}: NeftwerkImageProps) {
  const initialSrc = src && isPresignedMediaUrl(src) ? src : src;
  const [loaded, setLoaded] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(initialSrc);
  const [measured, setMeasured] = useState<{ w: number; h: number } | null>(
    width && height && width > 0 && height > 0 ? { w: width, h: height } : null
  );
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    if (imageAlreadyLoaded(imgRef.current)) {
      setLoaded(true);
      const img = imgRef.current;
      if (img && (!measured || measured.w <= 0)) {
        setMeasured({ w: img.naturalWidth, h: img.naturalHeight });
      }
    }
  }, [resolvedSrc, measured]);

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

  useEffect(() => {
    if (width && height && width > 0 && height > 0) {
      setMeasured({ w: width, h: height });
    }
  }, [width, height]);

  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  const resolvedFetchPriority = fetchPriority ?? (priority ? "high" : "auto");
  const intrinsicW = measured?.w ?? width;
  const intrinsicH = measured?.h ?? height;
  const hasIntrinsic =
    typeof intrinsicW === "number" &&
    typeof intrinsicH === "number" &&
    intrinsicW > 0 &&
    intrinsicH > 0;

  const onLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setLoaded(true);
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setMeasured({ w: img.naturalWidth, h: img.naturalHeight });
    }
    onLoadProp?.(event);
  };

  // max-h-full only works when the parent has a definite height; inherit picks up parent max-h-*.
  const imgClass =
    fit === "cover"
      ? `w-full h-full object-cover ${imgClassName}`
      : fit === "contain"
        ? `max-w-full max-h-[inherit] w-auto h-auto object-contain ${imgClassName}`
        : `w-full h-auto object-contain ${imgClassName}`;

  const wrapperClass =
    fit === "contain"
      ? `relative overflow-hidden flex w-fit max-w-full items-center justify-center ${className}`
      : fit === "cover"
        ? `relative overflow-hidden ${className}`
        : `relative overflow-hidden ${className}`;

  const wrapperStyle: React.CSSProperties = {
    ...style,
    ...(fit === "natural" && hasIntrinsic
      ? { aspectRatio: `${intrinsicW} / ${intrinsicH}` }
      : {}),
  };

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {!loaded && (
        <div
          className={
            fit === "natural" && !hasIntrinsic
              ? "w-full min-h-[12rem] bg-[#e0ddd8] animate-pulse"
              : "absolute inset-0 bg-[#e0ddd8] animate-pulse z-10"
          }
          aria-hidden
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={resolvedSrc}
        alt={alt}
        width={intrinsicW}
        height={intrinsicH}
        className={`${imgClass} transition-opacity duration-150 block ${
          loaded ? "opacity-100" : "opacity-0"
        } ${fit === "natural" && hasIntrinsic ? "absolute inset-0 h-full w-full" : ""}`}
        onLoad={onLoad}
        loading={resolvedLoading}
        fetchPriority={resolvedFetchPriority}
        decoding="async"
        {...props}
      />
    </div>
  );
}
