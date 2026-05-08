"use client";

import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function ProfilePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileTopBar title="Profile" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
      </header>

      <div className="p-4 pb-28 lg:pb-4">
        <div className="grid gap-4 justify-items-center">
          {/* Profile photo with ring */}
          <div className="relative mt-4">
            <div className="h-[140px] w-[140px] rounded-full border-4 border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/user.png"
                alt="Davina Vincent"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-[#1A3F6C]">Davina Vincent</h2>

          {/* Bio */}
          <p className="max-w-[420px] text-center text-sm leading-6 text-slate-500">
            Miami based collector interested in women artists from Latin America
            and supporting cultural initiatives within the region.
          </p>

          {/* Edit profile button */}
          <button
            className="inline-flex !rounded-full border border-slate-200 bg-[#f0ece8] px-10 py-3 text-[15px] font-bold text-[#1A3F6C] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.98]"
            type="button"
          >
            Edit profile
          </button>
        </div>

        {/* My Activity section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-semibold text-[#4D91A7] italic">
              My activity
            </h3>
            <div className="flex-1 border-t border-dashed border-[#4D91A7]/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200/60 p-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/fav1.png"
                alt="Fancy Free"
                className="w-full aspect-[4/3] object-cover"
              />
              <p className="mt-2 text-sm font-medium text-[#11181c]">
                Fancy Free
              </p>
            </div>
            <div className="bg-white border border-slate-200/60 p-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/profile2.png"
                alt="FUtility III"
                className="w-full aspect-[4/3] object-cover"
              />
              <p className="mt-2 text-sm font-medium text-[#11181c]">
                FUtility III
              </p>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
