import enUS from "./locales/en-US.json";
import es from "./locales/es.json";

/**
 * Single source of truth for supported languages.
 *
 * To add a new language:
 *   1. Create `locales/<code>.json` (copy `en-US.json` and translate).
 *   2. `import` it above.
 *   3. Add one entry to `SUPPORTED_LANGUAGES` below.
 * No other code changes are required — the i18n config, the Settings
 * language picker, and device detection all read from this list.
 */
export interface LanguageOption {
  /** BCP-47-ish code used as the i18next language key. */
  code: string;
  /** Name in the language itself (shown in the picker). */
  nativeLabel: string;
  /** Name in English (for accessibility / admin). */
  englishLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en-US", nativeLabel: "English (US)", englishLabel: "English (US)" },
  { code: "es", nativeLabel: "Español", englishLabel: "Spanish" },
];

export const DEFAULT_LANGUAGE = "en-US";

/** i18next `resources` map, built from the list above. */
export const resources: Record<string, { translation: Record<string, unknown> }> = {
  "en-US": { translation: enUS },
  es: { translation: es },
};

export const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

/**
 * Map an arbitrary locale string (e.g. a device locale like "es-ES" or "en")
 * to one of our supported codes, or `null` if unsupported.
 */
export function resolveSupportedLanguage(
  locale: string | null | undefined,
): string | null {
  if (!locale) return null;
  const lower = locale.toLowerCase();
  // Exact match first (e.g. "en-us").
  const exact = SUPPORTED_CODES.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;
  // Fall back to the primary subtag (e.g. "es-mx" -> "es", "en-gb" -> "en-US").
  const primary = lower.split("-")[0];
  const byPrimary = SUPPORTED_CODES.find(
    (c) => c.toLowerCase().split("-")[0] === primary,
  );
  return byPrimary ?? null;
}
