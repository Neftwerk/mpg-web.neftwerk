"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, LogOut } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { logout as authLogout, clearTokens } from "@/lib/auth-service";

interface AdminTopbarProps {
  onMenuToggle: () => void;
}

export function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment) => {
    // Capitalize and replace hyphens
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  });

  // Derive display values from the authenticated user
  const displayName = user?.fullName || user?.name as string || "Admin";
  const userRole = (user?.role as string)?.replace(/_/g, " ")?.toUpperCase() || "ADMIN";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";

  // Handle Logout — clear tokens, clear session cookie, redirect
  const handleLogout = async () => {
    try {
      await authLogout();
    } catch {
      clearTokens();
    }
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

        {/* Inbox — no urgency badge */}
        <button
          type="button"
          className="p-2 text-[#1A3F6C] hover:bg-[#1A3F6C]/5 transition-colors"
          aria-label="Messages"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Info — dynamically shows the logged-in admin's data */}
        <div className="flex items-center gap-2 border-l border-black/10 pl-4">
          <div className="w-7 h-7 bg-[#1A3F6C] text-[#f5f0ec] font-bold text-xs flex items-center justify-center">
            {loading ? "··" : initials}
          </div>
          <div className="hidden lg:block text-left leading-none">
            <span className="text-xs font-bold block text-[#11181c]">
              {loading ? "Loading…" : displayName}
            </span>
            <span className="text-[9px] font-bold tracking-wider text-[#1A3F6C]">
              {loading ? "—" : userRole}
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
