"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { detectInitialLanguage } from "./i18n";

/**
 * Wraps the app in the i18next context and, on mount, switches from the
 * default language to the persisted / device language. Running the switch in
 * an effect (rather than during render) keeps the server render and the first
 * client render identical, avoiding hydration mismatches.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initial = detectInitialLanguage();
    if (initial !== i18n.language) {
      i18n.changeLanguage(initial);
    }
    document.documentElement.lang = initial;
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
