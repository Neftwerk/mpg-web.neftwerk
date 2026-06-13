"use client";

import React from "react";

/**
 * Reusable skeleton building blocks for consistent shimmer loading states.
 * All skeletons use the app's neumorph card style + pulse animation.
 */

/** Single shimmer bar */
export function SkeletonBar({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`bg-[#e0ddd8] rounded-none animate-pulse ${className}`} />;
}

/** Circle shimmer (avatar, icon) */
export function SkeletonCircle({
  size = "h-10 w-10",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return <div className={`bg-[#e0ddd8] rounded-full animate-pulse ${size} ${className}`} />;
}

/** Gallery card skeleton — image + caption placeholder */
export function GalleryCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`card-neumorph ${className}`}>
      <SkeletonBar className="w-full aspect-[4/3]" />
      <div className="px-2 py-2 space-y-1">
        <SkeletonBar className="h-3 w-3/4" />
      </div>
    </div>
  );
}

/** Gallery grid skeleton — 2-column staggered */
export function GalleryGridSkeleton({ count = 6 }: { count?: number }) {
  const left = Array.from({ length: Math.ceil(count / 2) }, (_, i) => i);
  const right = Array.from({ length: Math.floor(count / 2) }, (_, i) => i);

  return (
    <div className="grid grid-cols-2 gap-3 items-start">
      <div className="flex flex-col gap-3">
        {left.map((i) => (
          <GalleryCardSkeleton key={`l-${i}`} />
        ))}
      </div>
      <div className="flex flex-col gap-3 mt-6">
        {right.map((i) => (
          <GalleryCardSkeleton key={`r-${i}`} />
        ))}
      </div>
    </div>
  );
}

/** Artwork detail skeleton — full page placeholder */
export function ArtworkDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image placeholder */}
      <div className="card-neumorph p-3 bg-white mb-6">
        <SkeletonBar className="w-full aspect-[4/3]" />
      </div>

      {/* Title */}
      <SkeletonBar className="h-5 w-3/4 mb-4" />

      {/* Artist row */}
      <div className="flex items-center gap-4 mb-6">
        <SkeletonCircle size="h-[46px] w-[46px]" />
        <SkeletonBar className="h-4 w-32" />
      </div>

      {/* Token details box */}
      <div className="bg-[#F8FAFB] border border-[#BAC4C8] p-5 mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <SkeletonBar className="h-3 w-12" />
          <SkeletonBar className="h-5 w-16" />
        </div>
        <div className="h-12 w-px bg-[#BAC4C8] opacity-60" />
        <div className="flex flex-col gap-2 flex-1 pl-4">
          <SkeletonBar className="h-3 w-14" />
          <SkeletonBar className="h-5 w-12" />
        </div>
        <div className="h-12 w-px bg-[#BAC4C8] opacity-60" />
        <div className="flex flex-col gap-2 flex-[0.8] items-end">
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-5 w-12" />
        </div>
      </div>

      {/* Description */}
      <SkeletonBar className="h-4 w-28 mb-3" />
      <SkeletonBar className="h-3 w-full mb-2" />
      <SkeletonBar className="h-3 w-full mb-2" />
      <SkeletonBar className="h-3 w-2/3 mb-8" />
    </div>
  );
}

/** Notification skeleton rows */
export function NotificationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card-neumorph animate-pulse p-4">
          <div className="flex gap-3">
            <SkeletonCircle size="h-8 w-8" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-3 w-3/4" />
              <SkeletonBar className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Profile page skeleton */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 pt-6 animate-pulse">
      {/* Avatar */}
      <SkeletonCircle size="h-[120px] w-[120px]" />
      {/* Name */}
      <SkeletonBar className="h-6 w-40 mt-1" />
      {/* Email */}
      <SkeletonBar className="h-3 w-32" />
      {/* Bio */}
      <SkeletonBar className="h-3 w-56" />
      <SkeletonBar className="h-3 w-48" />
      {/* Edit button */}
      <SkeletonBar className="h-10 w-36 mt-2" />
    </div>
  );
}

/** Activity grid skeleton — small artwork cards */
export function ActivityGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <GalleryCardSkeleton key={i} />
      ))}
    </div>
  );
}
