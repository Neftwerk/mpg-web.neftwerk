"use client";

import { useEffect } from "react";
import { clearSocketFiSessionOnPageReload } from "@/lib/socketfi-session";

/** Clears cached SocketFi session after browser refresh. */
export function SocketFiSessionRefreshReset() {
  useEffect(() => {
    clearSocketFiSessionOnPageReload();
  }, []);

  return null;
}
