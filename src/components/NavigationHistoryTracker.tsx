"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { noteInAppNavigation } from "@/lib/navigation-history";

/**
 * Counts in-app navigations so back controls know whether `router.back()` has
 * anywhere to go. Renders nothing.
 */
export function NavigationHistoryTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The landing page is not a navigation; it is where the user came in.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    noteInAppNavigation();
  }, [pathname]);

  return null;
}
