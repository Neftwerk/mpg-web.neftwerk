"use client";

import Link from "next/link";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useState, useEffect } from "react";
import { ArtworkItem } from "@/lib/gallery-service";
import { useUser } from "@/lib/UserContext";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { ProfileSkeleton, ActivityGridSkeleton } from "@/components/Skeletons";
import {
  listSavedArtworksForDisplay,
  subscribeToSaved,
} from "@/lib/saved-service";

export default function ProfilePage() {
  return <ProfileContent />;
}

function ProfileContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useUser();

  const [savedItems, setSavedItems] = useState<ArtworkItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      setSavedLoading(true);
      listSavedArtworksForDisplay()
        .then((items) => {
          if (!cancelled) setSavedItems(items);
        })
        .catch(() => {
          if (!cancelled) setSavedItems([]);
        })
        .finally(() => {
          if (!cancelled) setSavedLoading(false);
        });
    };

    load();
    const unsub = subscribeToSaved(load);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [user?.id]);

  const displayName = user?.fullName || "";
  const displayBio = user?.bio || "";
  const displayEmail = user?.email || "";

  return (
    <>
      <MobileTopBar title="Profile" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-5 pb-28 mt-20 lg:mt-0">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="flex flex-col items-center gap-3 pt-6">
            <Link
              href="/profile/edit"
              className="rounded-full p-[4px] cursor-pointer relative group transition duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #D4CCC7, #E8E2DD)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
              title="Edit profile"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.avatarUrl || "/images/default-avatar.svg"}
                alt={displayName}
                className="h-[120px] w-[120px] rounded-full object-cover group-hover:opacity-85 transition-opacity"
              />
              <div className="absolute inset-1 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[10px] uppercase tracking-widest font-bold text-white">
                  Edit
                </span>
              </div>
            </Link>

            <h2 className="text-[22px] font-bold text-[#1A3F6C] mt-1">
              {displayName}
            </h2>

            {displayEmail && (
              <p className="text-[13px] text-slate-400 -mt-1">{displayEmail}</p>
            )}

            {displayBio ? (
              <p className="max-w-[320px] text-center text-[14px] leading-relaxed text-[#333]">
                {displayBio}
              </p>
            ) : (
              <p className="max-w-[320px] text-center text-[13px] leading-relaxed text-slate-400 italic">
                No bio yet — edit your profile to add one.
              </p>
            )}

            <Link href="/profile/edit" className="btn-neumorph mt-2 px-10">
              Edit profile
            </Link>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[16px] font-bold text-[#1A3F6C] whitespace-nowrap">
              Saved
            </span>
            <div className="flex-1 border-t-[1.5px] border-dotted border-[#C4BCB6]" />
          </div>

          {savedLoading ? (
            <ActivityGridSkeleton count={2} />
          ) : savedItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {savedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/artwork/${item.id}`}
                  className="block card-neumorph overflow-hidden"
                >
                  <NeftwerkImage
                    src={item.mediaUrl}
                    alt={item.title}
                    fit="natural"
                    width={item.mediaWidth}
                    height={item.mediaHeight}
                    className="w-full"
                  />
                  <p className="px-2 py-2 text-[13px] font-medium text-[#11181c]">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
              Works you save while browsing or scanning stay here — even before you create an account.
              Purchases live in My Gallery.
            </p>
          )}
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
