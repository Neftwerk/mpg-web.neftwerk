"use client";

import { useTranslation } from "react-i18next";
import { AppTopBar } from "@/components/AppTopBar";
import { BrandLockup } from "@/components/BrandLockup";

export function AuthShell({
  titleKey,
  children,
  /** Mid-flow auth steps (OTP, reset) use history; landing pages go Home. */
  historyBack = false,
}: {
  /**
   * Translation key for the top-bar title (e.g. "auth.verifyOtpTitle"). Omit it
   * on a screen that already says what it is: login names itself in its own
   * heading, so a bar repeating the title above it is a second answer to a
   * question nobody asked twice.
   */
  titleKey?: string;
  children: React.ReactNode;
  historyBack?: boolean;
}) {
  const { t } = useTranslation();
  const showTopBar = titleKey !== undefined;
  // The deco pattern comes from the fixed layer in the root layout.
  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[520px] flex-col">
        {showTopBar && (
          <AppTopBar
            title={t(titleKey)}
            historyBack={historyBack}
            forwardHome={!historyBack}
          />
        )}
        {/* Without the bar the logo would otherwise start hard against the
            top edge of the viewport. */}
        <div className={`flex-1 px-4 pb-10 ${showTopBar ? "py-5" : "pt-9"}`}>
          <BrandLockup className="mb-6" />
          {children}
        </div>
      </div>
    </div>
  );
}
