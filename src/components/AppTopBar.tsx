"use client";

import { BackNavButton } from "@/components/BackNavButton";

/** Shared chrome so back icon + title sit in the same place on every screen. */
export const APP_TOP_BAR_ROW_CLASS =
  "flex items-center justify-between px-5 py-4 bg-[#F7F4F3]";

export const APP_TOP_BAR_TITLE_CLASS =
  "text-[18px] font-extrabold text-[#11181c] tracking-tight truncate";

type AppTopBarProps = {
  title: string;
  backHref?: string;
  historyBack?: boolean;
  /** When set, shows the hamburger on the right (collector app chrome). */
  onMenuOpen?: () => void;
  /** Pin under the status bar on mobile app pages. */
  fixed?: boolean;
  className?: string;
};

export function AppTopBar({
  title,
  backHref = "/home",
  historyBack = false,
  onMenuOpen,
  fixed = false,
  className = "",
}: AppTopBarProps) {
  return (
    <header
      className={`${APP_TOP_BAR_ROW_CLASS} ${
        fixed ? "lg:hidden fixed left-0 right-0 top-0 z-30" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <BackNavButton href={backHref} historyBack={historyBack} />
        <h1 className={APP_TOP_BAR_TITLE_CLASS}>{title}</h1>
      </div>

      {onMenuOpen ? (
        <button
          type="button"
          onClick={onMenuOpen}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
          aria-label="Open menu"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hamburger.svg" alt="" className="h-5 w-7" aria-hidden />
        </button>
      ) : (
        <div className="w-10 h-10 flex-shrink-0" aria-hidden />
      )}
    </header>
  );
}
