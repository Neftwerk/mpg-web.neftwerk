"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { logout, deactivateAccount, deleteAccount } from "@/lib/auth-service";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Account action modals
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleDeactivate = async () => {
    if (deactivateConfirm !== "DEACTIVATE") {
      setActionError('Please type "DEACTIVATE" to confirm.');
      return;
    }
    setActionLoading(true);
    setActionError("");
    const res = await deactivateAccount();
    if (res.ok) {
      router.replace("/login");
    } else {
      setActionError(res.message || "Failed to deactivate account.");
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") {
      setActionError('Please type "DELETE" to confirm.');
      return;
    }
    setActionLoading(true);
    setActionError("");
    const res = await deleteAccount();
    if (res.ok) {
      router.replace("/login");
    } else {
      setActionError(res.message || "Failed to delete account.");
    }
    setActionLoading(false);
  };

  return (
    <>
      {/* Sticky top bar */}
      <MobileTopBar title="Settings" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4 mt-20 lg:mt-0">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
      </header>

      <div className="px-5 pb-28 mt-20 lg:mt-6 flex flex-col gap-6 max-w-lg mx-auto">
        {/* ACCOUNT CARD */}
        <div className="card-neumorph p-5">
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
            <SettingsRow icon="notifications" label="Notifications" href="/notifications" />
            <SettingsRow icon="privacy" label="Privacy & Security" className="bg-[#EAECEF] -mx-2 px-2" />
          </div>
        </div>

        {/* PREFERENCES CARD */}
        <div className="card-neumorph p-5">
          <h2 className="text-[13px] font-bold text-[#1A3F6C] tracking-wide uppercase mb-2 pl-1">
            Preferences
          </h2>

          <div className="flex flex-col">
            <SettingsRow icon="language" label="Language" value="English" />
            <SettingsRow icon="help" label="Help & Support" />
            <SettingsRow icon="info" label="About Neftwerk" />
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="card-neumorph p-5 border border-red-100">
          <h2 className="text-[13px] font-bold text-red-500 tracking-wide uppercase mb-2 pl-1">
            Danger Zone
          </h2>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDeactivate(true);
                setActionError("");
                setDeactivateConfirm("");
              }}
              className="text-left py-3 px-1 text-[15px] font-semibold text-amber-600 hover:bg-amber-50/50 transition flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                Deactivate Account
              </span>
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDelete(true);
                setActionError("");
                setDeleteConfirm("");
              }}
              className="text-left py-3 px-1 text-[15px] font-semibold text-red-600 hover:bg-red-50/50 transition flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Account Permanently
              </span>
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="btn-neumorph mt-4 w-full py-4 text-rose-600 font-extrabold uppercase tracking-widest active:scale-[0.98]"
        >
          Logout
        </button>
      </div>

      {/* ─── Deactivate Modal ─── */}
      {showDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[400px] bg-[#F2F3F7] p-6 shadow-xl">
            <h3 className="text-lg font-bold text-amber-600 mb-2">Deactivate Account</h3>
            <p className="text-sm text-slate-600 mb-4">
              Your account will be deactivated and you will be logged out.
              You can contact support to reactivate later.
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Type <span className="font-bold text-amber-600">DEACTIVATE</span> to confirm:
            </p>
            {actionError && (
              <div className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 mb-3">
                {actionError}
              </div>
            )}
            <input
              className="w-full border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 mb-4"
              value={deactivateConfirm}
              onChange={(e) => setDeactivateConfirm(e.target.value)}
              placeholder="DEACTIVATE"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeactivate(false)}
                className="flex-1 py-3 text-sm font-medium text-slate-600 border border-slate-300 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={actionLoading || deactivateConfirm !== "DEACTIVATE"}
                className="flex-1 py-3 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Modal ─── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[400px] bg-[#F2F3F7] p-6 shadow-xl">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account</h3>
            <p className="text-sm text-slate-600 mb-4">
              This action is <span className="font-bold text-red-600">irreversible</span>.
              Your account and all data will be permanently deleted.
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </p>
            {actionError && (
              <div className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 mb-3">
                {actionError}
              </div>
            )}
            <input
              className="w-full border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 mb-4"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="flex-1 py-3 text-sm font-medium text-slate-600 border border-slate-300 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading || deleteConfirm !== "DELETE"}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
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
