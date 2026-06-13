"use client";

import { useEffect } from "react";
import { getSocketFiClient } from "@/lib/socketfi";
import {
  logSocketFiConnected,
  setStoredSocketFiSession,
} from "@/lib/socketfi-session";

/** Completes SocketFi auth when the hosted flow redirects back to the app. */
export function SocketFiRedirectHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("socketfi_auth") !== "success" || !params.get("code")) {
      return;
    }

    getSocketFiClient()
      .onSuccessRedirect()
      .then((session) => {
        if (session) {
          setStoredSocketFiSession(session);
          logSocketFiConnected(session, "redirect");
        }
      })
      .catch((error) => {
        console.error("[SocketFi] redirect exchange failed:", error);
      });
  }, []);

  return null;
}
