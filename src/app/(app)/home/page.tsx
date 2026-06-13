"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeHeader } from "@/components/home/HomeHeader";
import DiscoverIcon from "../../../../public/discovercard.svg";
import ForumIcon from "../../../../public/forumcard.svg";
import GalleryIcon from "../../../../public/gallerycard.svg";
import ProfileIcon from "../../../../public/profilecard.svg";
import WalletIcon from "../../../../public/walletcard.svg";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <div
      className="flex flex-col min-h-[100dvh] w-full bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/images/deco-pattern-background.svg')" }}
    >
      <HomeHeader onQrPress={() => router.push("/scan-qr")} />

      {/* Main content perfectly centered vertically and horizontally */}
      <div className="flex-1 flex items-center justify-center pt-[60px] pb-4">
        {/* Hexagon cluster container with absolute positioned children */}
        <div className="relative w-[334px] h-[373px] sm:scale-110 md:scale-125 transition-transform duration-300">

          {/* Forum */}
          <div className="absolute top-0 left-[63px]">
            <Link href="/forum" className="block transition-transform active:scale-95">
              <Image src={ForumIcon} alt="Forum" className="w-[145px] h-auto" />
            </Link>
          </div>

          {/* Gallery */}
          <div className="absolute top-[114px] left-0 z-10">
            <Link href="/gallery" className="block transition-transform active:scale-95">
              <Image src={GalleryIcon} alt="Gallery" className="w-[145px] h-auto" />
            </Link>
          </div>

          {/* Discover */}
          <div className="absolute top-[114px] left-[126px]">
            <Link href="/discover" className="block transition-transform active:scale-95">
              <Image src={DiscoverIcon} alt="Discover" className="w-[145px] h-auto" />
            </Link>
          </div>

          {/* Wallet */}
          <div className="absolute top-[228px] left-[63px]">
            <Link href="/wallet" className="block transition-transform active:scale-95">
              <Image src={WalletIcon} alt="Wallet" className="w-[145px] h-auto" />
            </Link>
          </div>

          {/* Profile */}
          <div className="absolute top-[228px] left-[189px]">
            <Link href="/profile" className="block transition-transform active:scale-95">
              <Image src={ProfileIcon} alt="Profile" className="w-[145px] h-auto" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}