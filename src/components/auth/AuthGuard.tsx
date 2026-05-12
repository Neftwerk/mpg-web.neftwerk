"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth-service";

/**
 * Wraps pages that require authentication.
 * If the user has no access token, they are redirected to /signup.
 * Public pages (discover, forum, gallery, etc.) should NOT use this.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/signup");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    // Show a brief loading state while checking auth
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#1A3F6C]" />
      </div>
    );
  }

  return <>{children}</>;
}
