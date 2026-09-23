"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MobileMenu } from "@/components/sidebar/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useUser } from "@/lib/UserContext";
import { updateProfile } from "@/lib/auth-service";
import { uploadImage } from "@/lib/storage-service";
import { ProfileSkeleton } from "@/components/Skeletons";

export default function EditProfilePage() {
  return (
    <AuthGuard>
      <EditProfileContent />
    </AuthGuard>
  );
}

function EditProfileContent() {
  const { t } = useTranslation();
  const { user, loading, refresh, patchUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setBio(user.bio || "");
  }, [user]);

  const email = user?.email || "";

  function validate(name: string, nextBio: string): string | null {
    const trimmedName = name.trim();
    const trimmedBio = nextBio.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return t("profile.edit.errors.nameRequired");
    }
    if (trimmedBio.length > 500) {
      return t("profile.edit.errors.bioTooLong");
    }
    return null;
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    const validationError = validate(fullName, bio);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      fullName: fullName.trim(),
      bio: bio.trim(),
    });

    if (result.ok) {
      patchUser({ fullName: fullName.trim(), bio: bio.trim() });
      setSuccess(t("profile.edit.detailsSaved"));
      setSaving(false);
      void refresh();
      return;
    }

    setError(result.message || t("profile.edit.errors.saveFailed"));
    setSaving(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("profile.edit.errors.notImageFile"));
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t("profile.edit.errors.imageTooLarge"));
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const uploadResult = await uploadImage(file);
    if (!uploadResult.ok) {
      setError(uploadResult.message || t("profile.edit.errors.uploadFailed"));
      setUploading(false);
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
      setSuccess(t("profile.edit.photoUpdated"));
      void refresh();
    } else {
      setError(result.message || t("profile.edit.errors.updatePhotoFailed"));
    }

    setUploading(false);
    e.target.value = "";
  }

  return (
    <>
      <PageHeader
        title={t("profile.editProfileButton")}
        backHref="/profile"
        backLabel="Back to Profile"
        onMenuOpen={() => setMenuOpen(true)}
      />

      <div className="px-5 pb-28 mt-20 lg:mt-6 max-w-lg mx-auto space-y-6">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Photo */}
            <div className="card-neumorph p-5 flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full p-[4px] cursor-pointer relative group transition duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #D4CCC7, #E8E2DD)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
                title={t("profile.edit.changePhoto")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.avatarUrl || "/images/default-avatar.svg"}
                  alt={fullName || "Profile"}
                  className="h-[120px] w-[120px] rounded-full object-cover group-hover:opacity-85 transition-opacity"
                />
                <div className="absolute inset-1 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white">
                    {t("profile.edit.changePhoto")}
                  </span>
                </div>
                {uploading && (
                  <div className="absolute inset-1 rounded-full bg-black/60 flex items-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest font-black text-white animate-pulse">
                      {t("common.saving")}
                    </span>
                  </div>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-xs font-bold text-[#1A3F6C] uppercase tracking-widest hover:underline"
              >
                {t("profile.edit.changePhoto")}
              </button>
            </div>

            {/* Account details */}
            <div className="card-neumorph p-5 space-y-4">
              <h2 className="text-[13px] font-bold text-[#1A3F6C] tracking-wide uppercase">
                {t("profile.edit.sectionTitle")}
              </h2>

              {error && (
                <div className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-none border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  {t("auth.nameLabel")}
                </label>
                <input
                  className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("profile.edit.namePlaceholder")}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  {t("auth.emailLabel")}
                </label>
                <input
                  className="w-full rounded-none border border-slate-200 bg-[#F7F8FA] px-3 py-3 text-sm text-slate-600 outline-none"
                  value={email}
                  readOnly
                  autoComplete="email"
                />
                <p className="mt-1.5 text-[12px] text-slate-400 leading-relaxed">
                  {t("profile.edit.emailInstructions")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-none"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("profile.edit.bioPlaceholder")}
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="btn-neumorph w-full disabled:opacity-50"
              >
                {saving ? t("profile.edit.savingButton") : t("profile.edit.saveButton")}
              </button>
            </div>
          </>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
