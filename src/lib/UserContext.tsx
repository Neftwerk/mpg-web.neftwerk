"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getProfile, getAccessToken, UserProfile, refreshAccessToken, clearTokens, setTokens } from "@/lib/auth-service";
import { resolveProfilePictureUrl } from "@/lib/storage-service";
import { mergeSavedOnLogin, resetSavedMergeState } from "@/lib/saved-service";

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  patchUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  patchUser: () => {},
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

  const patchUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  const refresh = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      resetSavedMergeState();
      return;
    }

    let result = await getProfile();

    if (!result.ok && (result.status === 401 || result.status === 403)) {
      const refreshRes = await refreshAccessToken();

      if (refreshRes.ok) {
        result = await getProfile();
      } else {
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

      if (profile) {
        const storedPicture =
          profile.profilePicture ||
          profile.avatarUrl ||
          profile.avatar ||
          profile.picture ||
          profile.photoUrl ||
          profile.image ||
          "";

        profile.avatarUrl = storedPicture
          ? await resolveProfilePictureUrl(String(storedPicture))
          : "";

        if (!profile.id && profile._id) {
          profile.id = String(profile._id);
        }
      }

      setUser(profile);

      const userKey = profile?.id ? String(profile.id) : profile?.email ? String(profile.email) : null;
      if (userKey) {
        void mergeSavedOnLogin(userKey);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Initial mount: check URL for OAuth tokens, then fetch profile
  useEffect(() => {
    extractTokensFromUrl();
    refresh();
  }, [refresh]);

  // Listen for auth state changes (same-tab via custom event, cross-tab via storage)
  useEffect(() => {
    const handleAuthChange = () => {
      refresh();
    };

    // Same-tab: fired by setTokens() / clearTokens()
    window.addEventListener("neft-auth-change", handleAuthChange);
    // Cross-tab: fired when another tab modifies localStorage
    window.addEventListener("storage", (e) => {
      if (e.key === "neft_access_token") handleAuthChange();
    });

    return () => {
      window.removeEventListener("neft-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, loading, refresh, patchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
