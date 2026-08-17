"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitSupportContact } from "@/lib/support";

export default function DeleteAccountPage() {
  const { t } = useTranslation();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmPrereqs, setConfirmPrereqs] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError(t("support.errors.enterName"));
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError(t("support.errors.invalidEmail"));
      return;
    }
    if (!confirmDelete || !confirmPrereqs) {
      setError(t("deleteAccountPage.formErrorCheckbox"));
      return;
    }

    setSubmitting(true);

    // Format a message for the support team
    const messageContent = [
      "ACCOUNT DELETION REQUEST VIA PUBLIC WEB FORM",
      "--------------------------------------------",
      `Full Name: ${trimmedName}`,
      `Registered Email: ${trimmedEmail}`,
      "",
      "CONFIRMATIONS:",
      `[Yes] I wish to permanently delete my account and all associated data.`,
      `[Yes] I understand this action is irreversible and I have withdrawn wallet balances.`,
      "",
      "ADDITIONAL NOTES:",
      notes.trim() || "(None provided)"
    ].join("\n");

    const res = await submitSupportContact({
      name: trimmedName,
      email: trimmedEmail,
      subject: "Account Deletion Request",
      message: messageContent,
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(res.message || t("support.errors.sendFailed"));
      return;
    }

    setSuccess(t("deleteAccountPage.formSuccess", { email: trimmedEmail }));
    // Reset form
    setFullName("");
    setEmail("");
    setNotes("");
    setConfirmDelete(false);
    setConfirmPrereqs(false);
  };

  return (
    <div className="min-h-screen flex flex-col pt-4 pb-16 px-4">
      {/* Brand Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8">
        <Link href="/home" className="flex items-center gap-2 group">
          <svg
            className="w-5 h-5 text-[#1A3F6C] transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-semibold text-[#1A3F6C] group-hover:underline">
            {t("common.back")}
          </span>
        </Link>
        <span className="text-base font-extrabold text-[#11181c] tracking-tight">
          My Pocket Gallery
        </span>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto grid gap-8 lg:grid-cols-5 items-start">
        {/* Left Side: Information & Instructions (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-neumorph p-6 space-y-4">
            <h1 className="text-2xl font-black text-[#1A3F6C] tracking-tight">
              {t("deleteAccountPage.title")}
            </h1>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              {t("deleteAccountPage.subtitle")}
            </p>
          </div>

          {/* Deletion Instructions */}
          <div className="card-neumorph p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <svg className="w-5 h-5 text-[#1A3F6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h2 className="text-[15px] font-bold text-[#1A3F6C] uppercase tracking-wide">
                {t("deleteAccountPage.inAppHeading")}
              </h2>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {t("deleteAccountPage.inAppBody")}
            </p>
            <ol className="text-[13px] text-slate-600 space-y-2 list-decimal list-inside pl-1 bg-white/40 p-3 rounded">
              <li>{t("deleteAccountPage.inAppStep1")}</li>
              <li>{t("deleteAccountPage.inAppStep2")}</li>
              <li>{t("deleteAccountPage.inAppStep3")}</li>
              <li>{t("deleteAccountPage.inAppStep4")}</li>
            </ol>
          </div>

          {/* Privacy Policy and Details */}
          <div className="card-neumorph p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <svg className="w-5 h-5 text-[#1A3F6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-[15px] font-bold text-[#1A3F6C] uppercase tracking-wide">
                {t("deleteAccountPage.policyHeading")}
              </h2>
            </div>

            {/* What is Deleted */}
            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#1a3f6c]">
                {t("deleteAccountPage.whatDeletedTitle")}
              </h3>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {t("deleteAccountPage.whatDeletedBody")}
              </p>
            </div>

            {/* What is Retained */}
            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#1a3f6c]">
                {t("deleteAccountPage.whatRetainedTitle")}
              </h3>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {t("deleteAccountPage.whatRetainedBody")}
              </p>
            </div>

            {/* Prerequisites */}
            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#1a3f6c]">
                {t("deleteAccountPage.prereqsTitle")}
              </h3>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {t("deleteAccountPage.prereqsBody")}
              </p>
            </div>

            {/* Confirmation */}
            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#1a3f6c]">
                {t("deleteAccountPage.confirmationTitle")}
              </h3>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {t("deleteAccountPage.confirmationBody")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Request Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-neumorph p-6 space-y-4">
            <div className="border-b border-slate-200/60 pb-2">
              <h2 className="text-[15px] font-bold text-[#1A3F6C] uppercase tracking-wide">
                {t("deleteAccountPage.webRequestSubtitle")}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t("deleteAccountPage.webRequestBody")}
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 leading-relaxed font-semibold">
                {t("deleteAccountPage.formErrorPrefix")}{error}
              </div>
            )}

            {success && (
              <div className="rounded-none border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-700 leading-relaxed font-medium">
                {success}
              </div>
            )}

            {/* Deletion Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="flex flex-col">
                <label htmlFor="fullName" className="field-label">
                  {t("deleteAccountPage.formFullName")}
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  disabled={submitting}
                  className="input-neumorph text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Registered Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="field-label">
                  {t("deleteAccountPage.formEmail")}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={submitting}
                  className="input-neumorph text-sm"
                  placeholder={t("deleteAccountPage.formEmailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Checkbox 1: Confirm Deletion */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  id="confirmDelete"
                  type="checkbox"
                  disabled={submitting}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1A3F6C] focus:ring-[#1A3F6C] cursor-pointer"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                />
                <label htmlFor="confirmDelete" className="text-[12px] text-slate-600 leading-snug cursor-pointer select-none">
                  {t("deleteAccountPage.formConfirmCheckbox1")}
                </label>
              </div>

              {/* Checkbox 2: Confirm Balance */}
              <div className="flex items-start gap-2.5">
                <input
                  id="confirmPrereqs"
                  type="checkbox"
                  disabled={submitting}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1A3F6C] focus:ring-[#1A3F6C] cursor-pointer"
                  checked={confirmPrereqs}
                  onChange={(e) => setConfirmPrereqs(e.target.checked)}
                />
                <label htmlFor="confirmPrereqs" className="text-[12px] text-slate-600 leading-snug cursor-pointer select-none">
                  {t("deleteAccountPage.formConfirmCheckbox2")}
                </label>
              </div>

              {/* Additional Notes */}
              <div className="flex flex-col">
                <label htmlFor="notes" className="field-label">
                  {t("deleteAccountPage.formAdditionalNotes")}
                </label>
                <textarea
                  id="notes"
                  disabled={submitting}
                  rows={3}
                  className="input-neumorph text-sm resize-none"
                  placeholder={t("deleteAccountPage.formAdditionalNotesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-neumorph w-full mt-4 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1A3F6C]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t("deleteAccountPage.formSubmitting")}</span>
                  </>
                ) : (
                  <span>{t("deleteAccountPage.formSubmit")}</span>
                )}
              </button>
            </form>
          </div>

          {/* Alternative Email Info */}
          <div className="card-neumorph p-5 space-y-3">
            <h3 className="text-[13px] font-bold text-[#1A3F6C] uppercase tracking-wide">
              {t("deleteAccountPage.emailSupportHeading")}
            </h3>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              {t("deleteAccountPage.emailSupportBody")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
