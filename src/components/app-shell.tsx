"use client";

import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar: STICKY ← Title ≡ */}
      <MobileTopBar title={title} onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </header>

      {/* Content — pb-28 to account for bigger bottom nav */}
      <div className="p-4 pb-28 lg:pb-4">{children}</div>

      {/* Mobile slide-out menu (triggered from hamburger) */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
