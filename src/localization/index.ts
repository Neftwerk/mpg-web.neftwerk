export { default as i18n, setLanguage, detectInitialLanguage, LANGUAGE_STORAGE_KEY } from "./i18n";
export { I18nProvider } from "./I18nProvider";
export { useLanguage } from "./useLanguage";
export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  resolveSupportedLanguage,
  type LanguageOption,
} from "./languages";
// Re-export the standard hook so consumers import everything from "@/localization".
export { useTranslation, Trans } from "react-i18next";
