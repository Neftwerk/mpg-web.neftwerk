"use client";
import Link from "next/link";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useState } from "react";
import { galleryItems } from "@/lib/content";

export default function ProfilePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  /* Pick first few gallery items as "activity" */
  const activityItems = galleryItems.slice(0, 2);

  return (
    <>
      <MobileTopBar title="Profile" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-5 pb-28 mt-20 lg:mt-0">
        {/* Profile hero */}
        <div className="flex flex-col items-center gap-3 pt-6">
          {/* Avatar with ring */}
          <div
            className="rounded-full p-[4px]"
            style={{
              background: "linear-gradient(135deg, #D4CCC7, #E8E2DD)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/user.png"
              alt="Davina Vincent"
              className="h-[120px] w-[120px] rounded-full object-cover"
            />
          </div>

          <h2 className="text-[22px] font-bold text-[#1A3F6C] mt-1">
            Davina Vincent
          </h2>
          <p className="max-w-[320px] text-center text-[14px] leading-relaxed text-[#333]">
            Miami based collector interested in women artists from Latin America
            and supporting cultural initiatives within the region.
          </p>

          {/* Edit profile button — neumorphic */}
          <button
            className="btn-neumorph mt-2 px-10"
            type="button"
          >
            Edit profile
          </button>
        </div>

        {/* My activity section */}
        <div className="mt-10">
          {/* Section header with dotted line */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[16px] font-bold text-[#1A3F6C] whitespace-nowrap">
              My activity
            </span>
            <div className="flex-1 border-t-[1.5px] border-dotted border-[#C4BCB6]" />
          </div>

          {/* Activity cards grid */}
          <div className="grid grid-cols-2 gap-3">
            {activityItems.map((item) => (
              <Link
                key={item.id}
                href={`/artwork/${item.id}`}
                className="block card-neumorph"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  className="w-full aspect-[4/3] object-cover"
                />
                <p className="px-2 py-2 text-[13px] font-medium text-[#11181c]">
                  {item.caption}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
