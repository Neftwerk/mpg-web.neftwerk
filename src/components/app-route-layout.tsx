"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";

export function AppRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mx-auto grid max-w-[1200px] gap-4 px-4 lg:grid-cols-[220px_1fr]">
        <Sidebar />
        <main className="min-h-[80dvh] overflow-hidden lg:border lg:border-slate-200 lg:bg-slate-50/90">
          {children}
        </main>
      </div>
    </div>
  );
}
