"use client";

// import { useCallback } from "react";
// import Image from "next/image";

interface HomeHeaderProps {
  onQrPress?: () => void;
  onMenuPress?: () => void;
}

export function HomeHeader(/* { onQrPress }: HomeHeaderProps */) {
  // const handleQrClick = useCallback(() => {
  //   onQrPress?.();
  // }, [onQrPress]);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#F7F4F3]">
      <h1 className="text-[18px] font-extrabold text-[#11181c] tracking-tight">
        My Pocket Gallery
      </h1>

      {/* Actions — QR scan (disabled) */}
      {/* <div className="flex items-center gap-3.5">
        <button
          onClick={handleQrClick}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="QR code"
        >
          <Image alt="" src="/Scan.svg" width={24} height={24} />
        </button>
      </div> */}
    </header>
  );
}
