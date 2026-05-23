"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function NewCollectionPage() {
  return (
    <AuthGuard>
      <NewCollectionContent />
    </AuthGuard>
  );
}

function NewCollectionContent() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileTopBar
        title="Discover Artwork"
        onMenuOpen={() => setMenuOpen(true)}
      />

      <div className="grid gap-4 mt-20 lg:mt-0max-w-[620px]">
        <label className="text-sm font-medium text-slate-700">
          Collection name
        </label>
        <input
          className="w-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          defaultValue="#African art"
        />
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          className="w-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          rows={4}
          placeholder="Optional notes for this collection"
        />
        <Link
          href="/collections"
          className="btn-neumorph"
        >
          Create Collection
        </Link>
      </div>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
