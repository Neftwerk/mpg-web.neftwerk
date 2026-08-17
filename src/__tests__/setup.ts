import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

// ── localStorage mock ──
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ── Reset between tests ──
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ── Stub window.dispatchEvent so auth-service events don't error ──
const realDispatch = window.dispatchEvent.bind(window);
window.dispatchEvent = vi.fn((event: Event) => realDispatch(event));

// ── Global fetch mock (tests override per-case) ──
global.fetch = vi.fn();

// ── Stub next/navigation for component tests ──
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// ── Stub react-i18next so translation keys pass through ──
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));
