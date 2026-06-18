"use client";
import Link from "next/link";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useState, useRef, useEffect } from "react";
import { fetchAllPublicArtworks, ArtworkItem } from "@/lib/gallery-service";
import { useUser } from "@/lib/UserContext";
import { updateProfile } from "@/lib/auth-service";
import { uploadImage } from "@/lib/storage-service";
import { NeftwerkImage } from "@/components/NeftwerkImage";
import { ProfileSkeleton, ActivityGridSkeleton } from "@/components/Skeletons";

export default function ProfilePage() {
  return <ProfileContent />;
}

function ProfileContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const { user, loading, refresh, patchUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Fetch recent artworks for "activity"
  const [activityItems, setActivityItems] = useState<ArtworkItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchAllPublicArtworks()
      .then((items) => setActivityItems(items.slice(0, 2)))
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, []);

  const displayName = user?.fullName || "";
  const displayBio = user?.bio || "";
  const displayEmail = user?.email || "";

  function getProfileFieldValues() {
    if (editing) {
      return { fullName: editName, bio: editBio };
    }
    return { fullName: user?.fullName || "", bio: user?.bio || "" };
  }

  function validateProfileFields(fullName: string, bio: string): string | null {
    const trimmedName = fullName.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return "Full name is required (at least 2 characters).";
    }

    if (!trimmedBio) {
      return "Bio is required. Please add a short bio before saving your profile.";
    }

    if (trimmedBio.length > 500) {
      return "Bio must not exceed 500 characters.";
    }

    return null;
  }

  function openEdit() {
    setEditName(user?.fullName || "");
    setEditBio(user?.bio || "");
    setSaveError("");
    setSaveSuccess("");
    setEditing(true);
  }

  async function handleSave() {
    setSaveError("");
    setSaveSuccess("");

    const validationError = validateProfileFields(editName, editBio);
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setSaving(true);

    const result = await updateProfile({
      fullName: editName.trim(),
      bio: editBio.trim(),
    });

    if (result.ok) {
      const trimmedName = editName.trim();
      const trimmedBio = editBio.trim();

      patchUser({ fullName: trimmedName, bio: trimmedBio });
      setEditing(false);
      setSaveSuccess("Profile updated!");
      setSaving(false);
      void refresh();
      return;
    }

    setSaveError(result.message || "Failed to update profile.");
    setSaving(false);
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { fullName, bio } = getProfileFieldValues();
    const validationError = validateProfileFields(fullName, bio);
    if (validationError) {
      setSaveError(validationError);
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSaveError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSaveError("Image is too large. Please select an image smaller than 10MB.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const uploadResult = await uploadImage(file);
    if (!uploadResult.ok) {
      setSaveError(uploadResult.message || "Failed to upload image.");
      setSaving(false);
      e.target.value = "";
      return;
    }

    patchUser({
      avatarUrl: uploadResult.data.downloadUrl,
      profilePicture: uploadResult.data.url,
    });

    const result = await updateProfile({
      profilePicture: uploadResult.data.url,
    });

    if (result.ok) {
      setSaveSuccess("Profile picture updated!");
      setSaving(false);
      e.target.value = "";
      void refresh();
      return;
    }

    setSaveError(result.message || "Failed to update profile picture.");
    setSaving(false);
    e.target.value = "";
  };

  return (
    <>
      <MobileTopBar title="Profile" onMenuOpen={() => setMenuOpen(true)} />

      <div className="px-5 pb-28 mt-20 lg:mt-0">
        {/* Profile hero */}
        {loading ? (
          <ProfileSkeleton />
        ) : (
        <div className="flex flex-col items-center gap-3 pt-6">
          {/* Avatar with ring - hoverable and clickable */}
          <div
            onClick={handleAvatarClick}
            className="rounded-full p-[4px] cursor-pointer relative group transition duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #D4CCC7, #E8E2DD)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
            title="Click to change profile picture"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.avatarUrl || "/images/default-avatar.svg"}
              alt={displayName}
              className="h-[120px] w-[120px] rounded-full object-cover group-hover:opacity-85 transition-opacity"
            />
            {/* Small camera/edit icon overlay on hover */}
            <div className="absolute inset-1 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            
            {/* Micro loading overlay while uploading */}
            {saving && (
              <div className="absolute inset-1 rounded-full bg-black/60 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest font-black text-white animate-pulse">
                  Saving
                </span>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />

          <h2 className="text-[22px] font-bold text-[#1A3F6C] mt-1">
            {displayName}
          </h2>

          {displayEmail && (
            <p className="text-[13px] text-slate-400 -mt-1">{displayEmail}</p>
          )}

          {saveError && !editing && (
            <div className="w-full max-w-[320px] rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {saveError}
            </div>
          )}
          {saveSuccess && !editing && (
            <div className="w-full max-w-[320px] rounded-none border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              {saveSuccess}
            </div>
          )}

          {displayBio ? (
            <p className="max-w-[320px] text-center text-[14px] leading-relaxed text-[#333]">
              {displayBio}
            </p>
          ) : (
            <p className="max-w-[320px] text-center text-[13px] leading-relaxed text-slate-400 italic">
              No bio yet — tap Edit profile to add one.
            </p>
          )}

          {/* Edit profile button */}
          <button
            className="btn-neumorph mt-2 px-10"
            type="button"
            onClick={openEdit}
          >
            Edit profile
          </button>
        </div>
        )}

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

              {/* Avatar Selector inside Modal */}
              <div className="flex flex-col items-center mb-6">
                <div
                  onClick={handleAvatarClick}
                  className="rounded-full p-[3px] cursor-pointer relative group transition"
                  style={{
                    background: "linear-gradient(135deg, #D4CCC7, #E8E2DD)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                  }}
                  title="Click to change profile picture"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user?.avatarUrl || "/images/default-avatar.svg"}
                    alt="Current Avatar"
                    className="h-[80px] w-[80px] rounded-full object-cover group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <span className="text-[9px] text-white font-extrabold uppercase tracking-wide">Edit</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="text-xs font-bold text-[#1A3F6C] hover:underline mt-2 uppercase tracking-widest"
                >
                  Change Photo
                </button>
              </div>

              <label className="block text-sm font-medium text-slate-600 mb-2">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 mb-4"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
              />

              <label className="block text-sm font-medium text-slate-600 mb-2">
                Bio <span className="text-red-500">*</span>
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

          {activityLoading ? (
            <ActivityGridSkeleton count={2} />
          ) : activityItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {activityItems.map((item) => (
               <Link
                key={item.id}
                href={`/artwork/${item.id}`}
                className="block card-neumorph"
              >
               <NeftwerkImage
                 src={item.mediaUrl}
                 alt={item.title}
                 className="w-full aspect-[4/3] object-cover"
               />
               <p className="px-2 py-2 text-[13px] font-medium text-[#11181c]">
                 {item.title}
               </p>
             </Link>
            ))}
          </div>
          ) : (
            <p className="text-xs text-slate-400 text-center">No recent activity.</p>
          )}
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
