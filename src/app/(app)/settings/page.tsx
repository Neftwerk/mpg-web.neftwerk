"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { logout } from "@/lib/auth-service";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    await logout();
    router.replace("/login"); // or /signup depending on auth flow
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] pb-10">
      {/* Top Bar */}
      <header className="flex items-center gap-4 px-5 py-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={() => window.history.back()} className="flex-shrink-0 flex items-center justify-center w-8 h-8 -ml-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/backarrow.svg" alt="Back" className="h-4 w-5" />
        </button>
        <h1 className="text-[20px] font-extrabold text-[#11181c] tracking-tight">Settings</h1>
      </header>

      <div className="px-5 mt-6 flex flex-col gap-6 max-w-lg mx-auto">
        {/* ACCOUNT CARD */}
        <div className="bg-[#F4F5F8] p-5 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.9)]">
          <h2 className="text-[13px] font-bold text-[#1A3F6C] tracking-wide uppercase mb-4 pl-1">
            Account
          </h2>

          <div className="flex items-center gap-4 mb-4 pl-1">
            <div className="rounded-full p-[3px] bg-gradient-to-br from-[#D4CCC7] to-[#E8E2DD] shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.avatarUrl || "/images/default-avatar.svg"}
                alt={user?.fullName || "User Avatar"}
                className="h-[50px] w-[50px] rounded-full object-cover bg-white"
              />
            </div>
            <div className="flex flex-col">
              {loading ? (
                <div className="h-5 w-24 bg-slate-200 animate-pulse" />
              ) : (
                <p className="text-[17px] font-bold text-[#1A3F6C]">
                  {user?.fullName || "No Name Set"}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-200/60 my-2" />

          <div className="flex flex-col">
            <SettingsRow icon="profile" label="Edit Profile" href="/profile" />
            <SettingsRow icon="notifications" label="Notifications" />
            <SettingsRow icon="privacy" label="Privacy & Security" className="bg-[#EAECEF] -mx-2 px-2" />
          </div>
        </div>

        {/* PREFERENCES CARD */}
        <div className="bg-[#F4F5F8] p-5 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.9)]">
          <h2 className="text-[13px] font-bold text-[#1A3F6C] tracking-wide uppercase mb-2 pl-1">
            Preferences
          </h2>

          <div className="flex flex-col">
            <SettingsRow icon="language" label="Language" value="English" />
            <SettingsRow icon="help" label="Help & Support" />
            <SettingsRow icon="info" label="About Neftwerk" />
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full py-4 bg-[#E75D51] text-white font-bold text-[16px] shadow-[0_4px_12px_rgba(231,93,81,0.3)] hover:bg-[#D54A3E] transition active:scale-[0.98]"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// Reusable Settings Row Component
function SettingsRow({ icon, label, value, href, className = "" }: { icon: string, label: string, value?: string, href?: string, className?: string }) {
  const content = (
    <div className={`flex items-center justify-between py-3.5 transition active:opacity-70 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Placeholder for icons, relying on text color or generic icons if SVG not available */}
        <div className="w-5 h-5 flex items-center justify-center text-[#38A8AB]">
          {getIcon(icon)}
        </div>
        <span className="text-[15px] font-semibold text-[#11181C]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[13px] text-slate-400 font-medium">{value}</span>}
        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return <div className="cursor-pointer">{content}</div>;
}

// Simple inline SVG provider for the settings icons
function getIcon(name: string) {
  switch (name) {
    case "profile":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "notifications":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "privacy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "language":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "info":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    default:
      return null;
  }
}
