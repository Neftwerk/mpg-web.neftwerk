"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/content";
import { useState } from "react";
import { useUser } from "@/lib/UserContext";

/* ─── Bottom-nav icon map: use the Figma-exported button SVGs ─── */
const bottomNavIconMap: Record<string, string> = {
  forum: "/images/forumbutton.svg",
  gallery: "/images/gallerybutton.svg",
  discover: "/images/discoverbutton.svg",
  wallet: "/images/walletbutton.svg",
  profile: "/images/profilebutton.svg",
};

/* ─── Menu / sidebar icon map ─── */
const menuIconMap: Record<string, string> = {
  home: "/images/homebutton.svg",
  forum: "/images/forumbutton.svg",
  gallery: "/images/gallerybutton.svg",
  discover: "/images/discoverbutton.svg",
  wallet: "/images/walletbutton.svg",
  profile: "/images/profilebutton.svg",
  settings: "/images/settings%20button.svg",
  support: "/images/supportbutton.svg",
};

/* ---------- Desktop sidebar (hidden on mobile) ---------- */
function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="hidden lg:sticky lg:flex flex-col gap-4 h-fit top-0 rounded-[14px] border border-slate-200 bg-white/90 p-4">
      <div className="flex flex-col gap-2 justify-center">
        <div className="flex items-center gap-2 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.avatarUrl || "/images/user.png"}
            alt="user image"
            className="h-[50px] w-[50px] rounded-full object-cover"
          />
          <h3 className="font-semibold text-[#1A3F6C]">{user?.fullName || "Guest"}</h3>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#D0C1BB]">
            <span className="font-medium text-[#1A3F6C]">23k</span>{" "}
            Followers
          </p>
          <p className="text-sm text-[#D0C1BB]">
            <span className="font-medium text-[#1A3F6C]">3k</span> Following
          </p>
        </div>
      </div>
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mb-2 flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold transition ${active
              ? "bg-sky-100 text-slate-900"
              : "text-slate-700 hover:bg-slate-100"
              }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={menuIconMap[item.icon] ?? "/images/forumbutton.svg"}
              alt=""
              className="h-9 w-9"
              aria-hidden
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Link
        href="/settings"
        className={`mb-2 flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold transition ${pathname === "/settings"
          ? "bg-sky-100 text-slate-900"
          : "text-slate-700 hover:bg-slate-100"
          }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/settings%20button.svg" alt="" className="h-9 w-9" aria-hidden />
        <span>Settings</span>
      </Link>
      <Link
        href="/support"
        className={`flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold transition ${pathname === "/support"
          ? "bg-sky-100 text-slate-900"
          : "text-slate-700 hover:bg-slate-100"
          }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/supportbutton.svg" alt="" className="h-9 w-9" aria-hidden />
        <span>Support</span>
      </Link>
    </aside>
  );
}

/* ---------- Mobile bottom nav — BIG neumorphic icons with shadows ---------- */
function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on home page — hexagons are the navigation there
  if (pathname === "/home") return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F7F4F3]/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      {/* Top shadow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />
      <div className="flex items-center justify-evenly px-2 pt-3 pb-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/forum" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1.5 w-[64px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bottomNavIconMap[item.icon] ?? "/images/forumbutton.svg"}
                alt=""
                className="h-[56px] w-[56px]"
                aria-hidden
              />
              <span
                className={`text-[13px] font-semibold leading-tight whitespace-nowrap ${active ? "text-[#38A8AB]" : "text-[#1A3F6C]"
                  }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- Mobile slide-out menu — slides LEFT to RIGHT ---------- */
function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const menuItems = [
    { href: "/home", label: "Home", icon: "home" },
    ...navItems.map((n) => ({ href: n.href, label: n.label, icon: n.icon })),
    { href: "/settings", label: "Settings", icon: "settings" },
    { href: "/support", label: "Support", icon: "support" },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
          aria-hidden
        />
      )}
      {/* Drawer — slides from LEFT */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[82%] max-w-[340px] bg-[#EFEBE9] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full px-6 pt-8 pb-6 overflow-y-auto">
          {/* <p className="mb-4 text-[34px] font-semibold leading-none text-slate-500/70">Menu</p> */}
          {/* User info */}
          <div className="flex items-center gap-4 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.avatarUrl || "/images/user.png"}
              alt={user?.fullName || "User"}
              className="h-[52px] w-[52px] rounded-full object-cover border-[2px] border-[#38A8AB]"
            />
            <h3 className="text-[20px] font-semibold text-[#1A3F6C]">
              {user?.fullName || "Guest"}
            </h3>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <p className="text-[15px]">
              <span className="font-bold text-[#1A3F6C]">23k</span>{" "}
              <span className="font-medium text-[#464646]">Followers</span>
            </p>
            <div className="h-4 border-l-[1.5px] border-dotted border-slate-400" />
            <p className="text-[15px]">
              <span className="font-bold text-[#1A3F6C]">3k</span>{" "}
              <span className="font-medium text-[#464646]">Following</span>
            </p>
          </div>

          {/* Shadow divider between profile and nav */}
          <div
            className="w-full mb-6 -mx-6"
            style={{
              height: 8,
              width: "calc(100% + 48px)",
              boxShadow: "inset 0px 4px 6px -2px rgba(0,0,0,0.12), inset 0px -1px 3px -1px rgba(255,255,255,0.6)",
              background: "linear-gradient(to bottom, #DDD7D2, #EFEBE9)",
            }}
          />

          {/* Nav links */}
          <nav className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-5 transition active:scale-[0.98]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={menuIconMap[item.icon] ?? "/images/forumbutton.svg"}
                    alt=""
                    className="h-[54px] w-[54px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
                    aria-hidden
                  />
                  <span className={`text-[17px] font-bold ${active ? "text-[#38A8AB]" : "text-[#11161C]"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

/* ---------- Top bar (mobile): FIXED ← Title ··· ≡ ---------- */
/* Uses the IMPORTED backarrow.svg and hamburger.svg */
export function MobileTopBar({
  title,
  onMenuOpen,
}: {
  title: string;
  onMenuOpen: () => void;
}) {
  return (
    <header className="lg:hidden fixed left-0 right-0 m top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#F7F4F3]">
      {/* Left: Back arrow + Title */}
      <div className="flex items-center gap-3">
        <Link href="/home" className="flex-shrink-0 flex items-center justify-center w-10 h-10 -ml-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/backarrow.svg" alt="Back" className="h-4 w-5" />
        </Link>
        <h1 className="text-[18px] font-extrabold text-[#11181c] tracking-tight">{title}</h1>
      </div>
      {/* Right: Hamburger menu — imported SVG */}
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
        aria-label="Open menu"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hamburger.svg" alt="" className="h-5 w-7" aria-hidden />
      </button>
    </header>
  );
}

/* ---------- Main export: combines everything ---------- */
export function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <DesktopSidebar />
      {/* <MobileBottomNav /> */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

/* Re-export for use in app-shell */
export { MobileMenu };