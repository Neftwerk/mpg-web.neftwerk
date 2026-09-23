"use client";

import { BackNavButton } from "@/components/BackNavButton";
import { MobileTopBar } from "@/components/sidebar/Sidebar";

/**
 * The top of an app screen, on both breakpoints.
 *
 * Every page used to hand-roll a `MobileTopBar` plus its own copy of the
 * desktop `<header>`. The two drifted: the mobile bar carried a back control
 * and the desktop one never did, so on a wide screen a detail page had no way
 * back at all. Declaring the parent once here keeps them in step.
 *
 * Pass `backHref` (or `historyBack`) on screens reached from another screen.
 * Sidebar destinations omit both: the sidebar is their back control on desktop,
 * and on mobile they keep the existing step up to Home.
 */
export function PageHeader({
  title,
  onMenuOpen,
  backHref,
  historyBack = false,
  backLabel,
  subtitle,
  actions,
}: {
  title: string;
  onMenuOpen: () => void;
  /** Parent screen. Omit on sidebar destinations. */
  backHref?: string;
  /** For a screen reachable from more than one parent. */
  historyBack?: boolean;
  backLabel?: string;
  subtitle?: string;
  /** Right-hand slot on the desktop header. */
  actions?: React.ReactNode;
}) {
  const hasBack = historyBack || backHref !== undefined;

  return (
    <>
      <MobileTopBar
        title={title}
        onMenuOpen={onMenuOpen}
        backHref={backHref ?? "/home"}
        historyBack={historyBack}
      />

      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <div className="flex min-w-0 items-center gap-2">
          {hasBack && (
            <BackNavButton
              href={backHref}
              historyBack={historyBack}
              aria-label={backLabel}
            />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
        {actions}
      </header>
    </>
  );
}
