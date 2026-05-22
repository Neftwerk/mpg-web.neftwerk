"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getProfile, getAccessToken, UserProfile, refreshAccessToken, clearTokens, setTokens } from "@/lib/auth-service";

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
});

/**
 * Check URL for OAuth callback tokens and store them.
 * Called once on mount to handle Google OAuth redirects.
 */
function extractTokensFromUrl(): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const accessToken =
    url.searchParams.get("accessToken") ||
    url.searchParams.get("token") ||
    url.searchParams.get("access_token");
  const refreshToken =
    url.searchParams.get("refreshToken") ||
    url.searchParams.get("refresh_token");

  if (accessToken) {
    console.log("[UserContext] Found OAuth tokens in URL, storing...");
    setTokens(accessToken, refreshToken || undefined);
    // Clean the URL so tokens aren't visible
    url.searchParams.delete("accessToken");
    url.searchParams.delete("token");
    url.searchParams.delete("access_token");
    url.searchParams.delete("refreshToken");
    url.searchParams.delete("refresh_token");
    window.history.replaceState({}, "", url.pathname + url.search);
    return true;
  }

  // Also check hash fragment (some OAuth flows use it)
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashToken =
      hashParams.get("accessToken") ||
      hashParams.get("token") ||
      hashParams.get("access_token");
    const hashRefresh =
      hashParams.get("refreshToken") ||
      hashParams.get("refresh_token");
    if (hashToken) {
      console.log("[UserContext] Found OAuth tokens in URL hash, storing...");
      setTokens(hashToken, hashRefresh || undefined);
      window.history.replaceState({}, "", window.location.pathname);
      return true;
    }
  }

  return false;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    console.log("[UserContext] refresh() called. Token exists:", !!token);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let result = await getProfile();
    console.log("[UserContext] getProfile() response:", JSON.stringify(result, null, 2));

    // If unauthorized, try to refresh the token once
    if (!result.ok && (result.status === 401 || result.status === 403)) {
      console.log("[UserContext] Token expired or invalid, attempting refresh...");
      const refreshRes = await refreshAccessToken();

      if (refreshRes.ok) {
        console.log("[UserContext] Token refreshed successfully, retrying profile fetch...");
        result = await getProfile();
        console.log("[UserContext] Retry getProfile() response:", JSON.stringify(result, null, 2));
      } else {
        console.log("[UserContext] Token refresh failed. Clearing tokens.");
        clearTokens();
        setUser(null);
        setLoading(false);
        return;
      }
    }

    if (result.ok && result.data) {
      // The API may nest the profile under result.data.data or result.data directly
      let profile = (result.data as any)?.data || result.data;

      // Sometimes it's nested under customer or user
      if (profile?.customer) profile = profile.customer;
      else if (profile?.user) profile = profile.user;

      // Ensure fullName exists (fallback to name, or firstName + lastName)
      if (profile && !profile.fullName) {
        profile.fullName =
          profile.name ||
          (profile.firstName
            ? `${profile.firstName} ${profile.lastName || ""}`.trim()
            : "");
      }

      // Use Google avatar if available and no avatarUrl set
      if (profile && !profile.avatarUrl) {
        profile.avatarUrl = profile.profilePicture || profile.avatar || profile.picture || profile.photoUrl || profile.image || "";
      }

      console.log("[UserContext] Final profile set:", profile);
      setUser(profile);
    } else {
      console.log("[UserContext] Failed to load profile:", result.message);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // First, check URL for OAuth callback tokens
    extractTokensFromUrl();
    // Then fetch profile
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
