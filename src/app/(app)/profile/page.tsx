"use client";
import Link from "next/link";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useState } from "react";
import { galleryItems } from "@/lib/content";
import { useUser } from "@/lib/UserContext";
import { updateProfile } from "@/lib/auth-service";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const { user, loading, refresh } = useUser();

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Pick first few gallery items as "activity"
  const activityItems = galleryItems.slice(0, 2);

  const displayName = user?.fullName || "Guest";
  const displayBio = user?.bio || "";
  const displayEmail = user?.email || "";

  function openEdit() {
    setEditName(user?.fullName || "");
    setEditBio(user?.bio || "");
    setSaveError("");
    setSaveSuccess("");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const result = await updateProfile({
      fullName: editName,
      bio: editBio,
    });

    if (result.ok) {
      setSaveSuccess("Profile updated!");
      await refresh();
      setTimeout(() => {
        setEditing(false);
        setSaveSuccess("");
      }, 1000);
    } else {
      setSaveError(result.message || "Failed to update profile.");
    }

    setSaving(false);
  }

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
              src={user?.avatarUrl || "/images/user.png"}
              alt={displayName}
              className="h-[120px] w-[120px] rounded-full object-cover"
            />
          </div>

          {loading ? (
            <div className="h-6 w-32 bg-slate-200 animate-pulse mt-1" />
          ) : (
            <h2 className="text-[22px] font-bold text-[#1A3F6C] mt-1">
              {displayName}
            </h2>
          )}

          {displayEmail && !loading && (
            <p className="text-[13px] text-slate-400 -mt-1">{displayEmail}</p>
          )}

          {displayBio ? (
            <p className="max-w-[320px] text-center text-[14px] leading-relaxed text-[#333]">
              {displayBio}
            </p>
          ) : !loading ? (
            <p className="max-w-[320px] text-center text-[13px] leading-relaxed text-slate-400 italic">
              No bio yet — tap Edit profile to add one.
            </p>
          ) : null}

          {/* Edit profile button */}
          <button
            className="btn-neumorph mt-2 px-10"
            type="button"
            onClick={openEdit}
          >
            Edit profile
          </button>
        </div>

        {/* ─── Edit Profile Modal ─── */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[400px] bg-[#F2F3F7] p-6 shadow-xl">
              <h3 className="text-lg font-bold text-[#1A3F6C] mb-5">Edit Profile</h3>

              {saveError && (
                <div className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 mb-4">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="rounded-none border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600 mb-4">
                  {saveSuccess}
                </div>
              )}

              <label className="block text-sm font-medium text-slate-600 mb-2">
                Full name
              </label>
              <input
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 mb-4"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
              />

              <label className="block text-sm font-medium text-slate-600 mb-2">
                Bio
              </label>
              <textarea
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 mb-6 resize-none"
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 text-sm font-medium text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-neumorph flex-1 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My activity section */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[16px] font-bold text-[#1A3F6C] whitespace-nowrap">
              My activity
            </span>
            <div className="flex-1 border-t-[1.5px] border-dotted border-[#C4BCB6]" />
          </div>

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
