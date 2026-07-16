"use client";

import { AppTopBar } from "@/components/AppTopBar";

/**
 * Mid-flow shell (link card / bank / wallet). Same back icon + placement;
 * history step-back so people don't lose progress.
 */
export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#F7F4F3] min-h-[100dvh]">
      <AppTopBar title={title} historyBack />
      <div className="px-5 pb-10 lg:px-6">{children}</div>
    </section>
  );
}
