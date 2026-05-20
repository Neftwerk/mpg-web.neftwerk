"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/app-shell";
import { clearTokens } from "@/lib/auth-service";
import { useUser } from "@/lib/UserContext";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { user } = useUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function handleLogout() {
    clearTokens();
    localStorage.removeItem("neft_user");
    router.replace("/login");
  }

  return (
    <>
      <AppShell title="Settings">
        <div className="max-w-[520px] mx-auto py-4 flex flex-col gap-6">
          {/* ── Account Section ── */}
          <div className="card-neumorph px-5 py-5">
            <h2 className="text-[15px] font-bold text-[#1A3F6C] mb-4 uppercase tracking-wide">
              Account
            </h2>

            {/* User info row */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.avatarUrl || "/images/default-avatar.svg"}
                alt={user?.fullName || "User"}
                className="h-[44px] w-[44px] rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#1A3F6C] truncate">
                  {user?.fullName || ""}
                </p>
                {user?.email && (
                  <p className="text-[13px] text-slate-400 truncate">{user.email}</p>
                )}
              </div>
            </div>

            {/* Settings rows */}
            <div className="flex flex-col gap-1">
              <SettingsRow
                label="Edit Profile"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                onClick={() => router.push("/profile")}
              />
              <SettingsRow
                label="Notifications"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
              />
              <SettingsRow
                label="Privacy & Security"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* ── Preferences Section ── */}
          <div className="card-neumorph px-5 py-5">
            <h2 className="text-[15px] font-bold text-[#1A3F6C] mb-4 uppercase tracking-wide">
              Preferences
            </h2>
            <div className="flex flex-col gap-1">
              <SettingsRow
                label="Language"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                }
                trailing="English"
              />
              <SettingsRow
                label="Help & Support"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                onClick={() => router.push("/support")}
              />
              <SettingsRow
                label="About Neftwerk"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* ── Logout Button ── */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-full text-[16px] font-bold text-white transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)",
              boxShadow:
                "10px 10px 14px 0px rgba(229, 222, 217, 1), 4px 4px 6px 0px rgba(255,255,255,0.15) inset",
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>

          <p className="text-center text-[12px] text-slate-400 pb-4">
            Neftwerk v1.0
          </p>
        </div>
      </AppShell>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-5"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-[380px] card-neumorph p-0 overflow-hidden animate-[fadeScaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header with accent */}
            <div
              className="px-6 pt-6 pb-4"
              style={{
                background: "linear-gradient(180deg, rgba(192,57,43,0.06) 0%, transparent 100%)",
              }}
            >
              {/* Logout icon circle */}
              <div className="mx-auto mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)",
                  boxShadow: "0 4px 14px rgba(231,76,60,0.3)",
                }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>

              <h3 className="text-center text-[18px] font-bold text-[#1A3F6C]">
                Log Out?
              </h3>
              <p className="text-center text-[14px] text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to log out of your account? You&apos;ll need to sign in again to access your profile.
              </p>
            </div>

            {/* Neumorphic divider */}
            <div
              className="w-full"
              style={{
                height: 4,
                boxShadow:
                  "inset 0px 2px 4px -1px rgba(0,0,0,0.1), inset 0px -1px 2px -1px rgba(255,255,255,0.5)",
                background: "linear-gradient(to bottom, #E5DED9, #F2F3F7)",
              }}
            />

            {/* Action buttons */}
            <div className="flex gap-3 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="btn-neumorph flex-1 !py-3 text-[14px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3 rounded-full text-[14px] font-bold text-white transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)",
                  boxShadow:
                    "10px 10px 14px 0px rgba(229, 222, 217, 1), 4px 4px 6px 0px rgba(255,255,255,0.15) inset",
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframe for the modal */}
      <style jsx>{`
        @keyframes fadeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

/* ── Reusable Settings Row ── */
function SettingsRow({
  label,
  icon,
  trailing,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  trailing?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 w-full px-2 py-3.5 rounded-xl text-left transition-colors hover:bg-[#E8E2DD]/50 active:bg-[#E8E2DD]/80 group"
    >
      <span className="flex-shrink-0 text-[#38A8AB]">{icon}</span>
      <span className="flex-1 text-[15px] font-semibold text-[#11181c]">{label}</span>
      {trailing && (
        <span className="text-[13px] text-slate-400 mr-1">{trailing}</span>
      )}
      <svg
        className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
