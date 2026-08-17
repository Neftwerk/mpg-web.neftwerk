"use client";

import { useTranslation } from "react-i18next";
import { useLanguage } from "@/localization";

/**
 * Single-select language picker. Selecting a language applies it instantly
 * (the whole app re-renders via the i18next context) and persists the choice.
 */
export function LanguagePickerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language, languages, setLanguage } = useLanguage();

  if (!open) return null;

  const isActive = (code: string) =>
    code === language || code.toLowerCase() === language?.toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-[#F2F3F7] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[#1A3F6C] mb-4">
          {t("settings.chooseLanguage")}
        </h3>

        <div className="flex flex-col">
          {languages.map((lang) => {
            const active = isActive(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                className="flex items-center justify-between py-3.5 text-left transition active:opacity-70"
              >
                <span className="text-[15px] font-semibold text-[#11181C]">
                  {lang.nativeLabel}
                </span>
                {active && (
                  <svg
                    className="w-5 h-5 text-[#38A8AB]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-3 text-sm font-medium text-slate-600 border border-slate-300 bg-white hover:bg-slate-50"
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
