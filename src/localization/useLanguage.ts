"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageOption } from "./languages";
import { setLanguage as applyLanguage } from "./i18n";

/**
 * Convenience hook for language UI (e.g. the Settings picker).
 * Reading `language` subscribes the component to language changes so it
 * re-renders instantly when the user switches.
 */
export function useLanguage(): {
  language: string;
  languages: LanguageOption[];
  setLanguage: (code: string) => void;
  current: LanguageOption | undefined;
} {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const setLanguage = useCallback((code: string) => {
    applyLanguage(code);
  }, []);

  const current = SUPPORTED_LANGUAGES.find(
    (l) => l.code === language || l.code.toLowerCase() === language?.toLowerCase(),
  );

  return { language, languages: SUPPORTED_LANGUAGES, setLanguage, current };
}
