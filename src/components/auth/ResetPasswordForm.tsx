"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useTranslation, Trans } from "react-i18next";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const emailHint = useMemo(
    () => searchParams.get("email")?.trim() ?? "",
    [searchParams],
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const canSubmit =
    password.length > 0 && password === confirm && password.length >= 8;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-0">
        <p className="mb-2 text-xl font-semibold text-slate-900">{t("auth.passwordUpdatedTitle")}</p>
        <div className="mb-2 h-1.5 w-[9%] max-w-[72px] bg-sky-900" />
        <p className="text-sm leading-6 text-slate-600">
          {t("auth.passwordUpdatedBody")}
        </p>
        <div className="mt-7 flex justify-center">
          <Link
            href="/login"
            className="w-[60%] max-w-[320px] border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition hover:bg-slate-100 text-center"
          >
            {t("auth.backToLogin")}
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700">
            {t("auth.cancelAndReturnToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-0" onSubmit={onSubmit}>
      <p className="mb-2 text-xl font-semibold text-slate-900">{t("auth.chooseNewPasswordTitle")}</p>
      <div className="mb-2 h-1.5 w-[9%] max-w-[72px] bg-sky-900" />
      {emailHint ? (
        <p className="text-sm leading-6 text-slate-600">
          <Trans
            i18nKey="auth.forEmail"
            values={{ emailHint }}
            components={[<strong key="0" className="font-semibold text-slate-800" />]}
          />
        </p>
      ) : (
        <p className="text-sm leading-6 text-slate-600">{t("auth.enterNewPasswordInstructions")}</p>
      )}

      <label className="mt-5 first:mt-4 mb-2 block text-sm font-medium text-slate-600" htmlFor="reset-password">
        {t("auth.newPasswordLabel")}
      </label>
      <input
        id="reset-password"
        className="w-full border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        type="password"
        autoComplete="new-password"
        placeholder={t("auth.newPasswordPlaceholder")}
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />

      <label className="mt-5 first:mt-4 mb-2 block text-sm font-medium text-slate-600" htmlFor="reset-confirm">
        {t("auth.confirmPasswordLabel")}
      </label>
      <input
        id="reset-confirm"
        className="w-full border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        type="password"
        autoComplete="new-password"
        placeholder={t("auth.confirmPasswordPlaceholder")}
        value={confirm}
        onChange={(ev) => setConfirm(ev.target.value)}
      />
      {confirm.length > 0 && password !== confirm ? (
        <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
          {t("auth.errors.passwordsDoNotMatch")}
        </p>
      ) : null}

      <div className="mt-7 flex justify-center">
        <button
          type="submit"
          className="w-[60%] max-w-[320px] border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canSubmit}
        >
          {t("auth.updatePasswordButton")}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-sky-900 underline underline-offset-2 hover:text-sky-700">
          {t("auth.cancelAndReturnToLogin")}
        </Link>
      </p>
    </form>
  );
}
