"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";

export function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/home";

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`flex-1 mx-auto w-full max-w-[1200px] ${isHome ? "" : "grid gap-4 px-0 lg:px-4 lg:grid-cols-[220px_1fr]"}`}>
        <Sidebar />
        <main className={`min-h-[100dvh] overflow-x-hidden ${
          isHome
            ? ""
            : "lg:rounded-[14px] lg:border lg:border-slate-200"
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
