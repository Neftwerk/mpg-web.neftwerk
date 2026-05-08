"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Top bar — FIXED, "My Pocket Gallery" + QR icon, solid bg */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-5 bg-[#F7F4F3]">
        <h1 className="text-[28px] font-extrabold text-[#11181c] tracking-tight">
          My Pocket Gallery
        </h1>
        <Link href="/scan-qr" className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ScanQR.svg"
            alt="Scan QR"
            className="h-9 w-9"
          />
        </Link>
      </header>

      {/* Hexagonal cards — centered vertically & horizontally
          The deco-pattern background shows through from AppRouteLayout */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          {/* Row 1: Forum (centered) */}
          <div className="flex justify-center mb-[-26px] z-10">
            <Link href="/forum" className="block transition-transform active:scale-95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/forumcard.svg"
                alt="Forum"
                className="w-[160px] h-auto drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Row 2: Gallery + Discover */}
          <div className="flex justify-center mb-[-26px] z-[5]">
            <Link href="/gallery" className="block transition-transform active:scale-95 -mr-[6px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/gallerycard.svg"
                alt="Gallery"
                className="w-[160px] h-auto drop-shadow-sm"
              />
            </Link>
            <Link href="/discover" className="block transition-transform active:scale-95 -ml-[6px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/discovercard.svg"
                alt="Discover"
                className="w-[160px] h-auto drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Row 3: Wallet + Profile */}
          <div className="flex justify-center z-[1]">
            <Link href="/wallet" className="block transition-transform active:scale-95 -mr-[6px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/walletcard.svg"
                alt="Wallet"
                className="w-[160px] h-auto drop-shadow-sm"
              />
            </Link>
            <Link href="/profile" className="block transition-transform active:scale-95 -ml-[6px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/profilecard.svg"
                alt="Profile"
                className="w-[160px] h-auto drop-shadow-sm"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
