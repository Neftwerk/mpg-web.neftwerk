import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  resources,
  resolveSupportedLanguage,
  SUPPORTED_CODES,
} from "./languages";

export const LANGUAGE_STORAGE_KEY = "neft.language";

/**
 * i18next is initialised synchronously with the DEFAULT language so that the
 * server render and the first client render agree (no hydration mismatch).
 * The persisted / device language is applied on the client after mount by
 * `I18nProvider`.
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_CODES,
    defaultNS: "translation",
    interpolation: {
      // React already escapes values, so i18next escaping would double-encode.
      escapeValue: false,
    },
    react: {
      // We drive re-renders via context; Suspense is unnecessary and awkward
      // with the App Router client boundary.
      useSuspense: false,
    },
  });
}

/**
 * Determine which language to show on the client:
 *   1. a previously saved preference,
 *   2. otherwise the device language (if supported),
 *   3. otherwise the default (English US).
 */
export function detectInitialLanguage(): string {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const savedResolved = resolveSupportedLanguage(saved);
    if (savedResolved) return savedResolved;
  } catch {
    // localStorage may be unavailable (private mode / SSR edge) — ignore.
  }

  const nav = window.navigator;
  const candidates = [
    ...(nav?.languages ?? []),
    nav?.language,
  ].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const resolved = resolveSupportedLanguage(candidate);
    if (resolved) return resolved;
  }

  return DEFAULT_LANGUAGE;
}

/** Change the active language and persist the choice locally. */
export function setLanguage(code: string): void {
  const resolved = resolveSupportedLanguage(code) ?? DEFAULT_LANGUAGE;
  if (i18n.language !== resolved) {
    i18n.changeLanguage(resolved);
  }
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
  } catch {
    // Persisting is best-effort.
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = resolved;
  }
}

export default i18n;
