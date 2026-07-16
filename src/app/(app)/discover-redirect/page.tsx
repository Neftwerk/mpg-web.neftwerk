"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function DiscoverRedirectPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileTopBar
        title="Discover Artwork"
        onMenuOpen={() => setMenuOpen(true)}
      />

      <div className="card-neumorph text-center">
        <p className="mb-5 text-lg font-semibold text-slate-900">
          Purchase flow will happen in a third party application
        </p>
        <Link
          href="/discover"
          className="btn-neumorph"
        >
          Continue
        </Link>
      </div>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
