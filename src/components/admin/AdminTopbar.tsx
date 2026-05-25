"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, LogOut } from "lucide-react";

interface AdminTopbarProps {
  onMenuToggle: () => void;
}

export function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment) => {
    // Capitalize and replace hyphens
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  });

  // Handle Logout by clearing the mock cookie
  const handleLogout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
    router.refresh();
  };

  // Mock checking environment (we can configure this via env variables if needed)
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  return (
    <header
      className="sticky top-0 right-0 z-30 h-[60px] bg-[#f5f0ec] px-6 flex items-center justify-between border-b border-black/5"
      style={{
        boxShadow: "0 4px 8px rgba(229,222,217,1), 0 -4px 0 rgba(255,255,255,1)",
      }}
    >
      {/* Left side: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-[#1A3F6C] hover:bg-black/5 btn-neumorph py-1.5 px-2"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#1A3F6C]/70">
          <span className="hover:text-[#1A3F6C] cursor-pointer">ADMIN</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-[#11181c]/40 font-normal">/</span>
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? "text-[#11181c] font-black"
                    : "hover:text-[#1A3F6C] cursor-pointer"
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right side: Environment badge, notifications, avatar, logout */}
      <div className="flex items-center gap-4">
        {/* Environment badge */}
        {isProduction ? (
          <span className="status-badge bg-green-100 text-green-800 border border-green-200">
            PRODUCTION
          </span>
        ) : (
          <span className="status-badge bg-amber-100 text-amber-800 border border-amber-200">
            STAGING
          </span>
        )}

        {/* Notification Bell */}
        <button className="p-2 text-[#1A3F6C] hover:bg-[#1A3F6C]/5 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 border-l border-black/10 pl-4">
          <div className="w-7 h-7 bg-[#1A3F6C] text-[#f5f0ec] font-bold text-xs flex items-center justify-center">
            AN
          </div>
          <div className="hidden lg:block text-left leading-none">
            <span className="text-xs font-bold block text-[#11181c]">
              Adaeze Nwosu
            </span>
            <span className="text-[9px] font-bold tracking-wider text-[#1A3F6C]">
              SUPER ADMIN
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn-neumorph text-xs py-1 px-3 flex items-center gap-1.5 font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
