"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { useUser } from "@/lib/UserContext";
import { APP_VERSION, submitSupportContact } from "@/lib/support";

export default function SupportPage() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.fullName || "");
    setEmail((current) => current || user.email || "");
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    if (!trimmed.name || trimmed.name.length < 2) {
      setError(t("support.errors.enterName"));
      return;
    }
    if (!trimmed.email || !trimmed.email.includes("@")) {
      setError(t("support.errors.invalidEmail"));
      return;
    }
    if (!trimmed.subject || trimmed.subject.length < 3) {
      setError(t("support.errors.addSubject"));
      return;
    }
    if (!trimmed.message || trimmed.message.length < 10) {
      setError(t("support.errors.moreMessage"));
      return;
    }

    setSubmitting(true);
    const res = await submitSupportContact(trimmed);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.message || t("support.errors.sendFailed"));
      return;
    }

    setSuccess(
      res.message || t("support.successMessage"),
    );
  }

  return (
    <>
      <MobileTopBar title={t("support.title")} onMenuOpen={() => setMenuOpen(true)} />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">{t("support.title")}</h1>
      </header>

      <div className="px-5 pb-28 mt-20 lg:mt-6 max-w-lg mx-auto space-y-6">
        {success ? (
          <div className="card-neumorph p-5">
            <p className="text-[15px] text-slate-700 leading-relaxed text-center">
              {success}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-neumorph p-5 space-y-4">
            <div>
              <h2 className="text-[13px] font-bold text-[#1A3F6C] tracking-wide uppercase">
                {t("support.writeToUs")}
              </h2>
              <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                {t("support.subtitle")}
              </p>
            </div>

            {error && (
              <div className="rounded-none border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="support-name">
                {t("support.nameLabel")}
              </label>
              <input
                id="support-name"
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="support-email">
                {t("support.emailLabel")}
              </label>
              <input
                id="support-email"
                type="email"
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="support-subject">
                {t("support.subjectLabel")}
              </label>
              <input
                id="support-subject"
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="support-message">
                {t("support.messageLabel")}
              </label>
              <textarea
                id="support-message"
                rows={5}
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-neumorph w-full disabled:opacity-50"
            >
              {submitting ? t("support.sending") : t("support.sendMessage")}
            </button>
            <p className="text-[12px] text-slate-400 text-center">
              {t("support.appVersion", { version: APP_VERSION })}
            </p>
          </form>
        )}
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
