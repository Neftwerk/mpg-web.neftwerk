"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getProfile, getAccessToken, UserProfile, clearTokens, setTokens } from "@/lib/auth-service";
import { resolveProfilePictureUrl } from "@/lib/storage-service";
import { mergeSavedOnLogin, resetSavedMergeState } from "@/lib/saved-service";
import { createCollectorWallet } from "@/lib/collector-service";

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

/**
 * One provisioning attempt per user per page load.
 *
 * `refresh()` runs on mount and on every auth-change event, and React invokes
 * effects twice in development — without this a single sign-in fires several
 * creates. They are idempotent server-side, but they are still wasted calls.
 */
const provisioning = new Set<string>();

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const patchUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  /**
   * Gives the collector a Stellar wallet if they have none.
   *
   * Done at sign-in rather than behind a button on the wallet page: by the time a
   * collector opens their wallet the address should already be there, and the only
   * thing left is funding it.
   *
   * `POST /collector/wallet` is get-or-create on the server — it returns the
   * existing wallet rather than a second one — so this cannot leave a collector
   * with two addresses their funds are split across.
   */
  const provisionWallet = useCallback(
    async (userId: string) => {
      if (!userId || provisioning.has(userId)) return;
      provisioning.add(userId);

      const result = await createCollectorWallet();
      if (result.ok) {
        patchUser({ stellarAddress: result.data.address });
        return;
      }

      // Never allowed to block sign-in. A collector without a wallet can still
      // browse, and the wallet page reads the real state when they arrive.
      console.error("Could not provision the collector wallet:", result.message);
      provisioning.delete(userId);
    },
    [patchUser],
  );

  const refresh = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      resetSavedMergeState();
      return;
    }

    // getProfile → authedFetch already refreshes the access token on expiry
    let result = await getProfile();

    if (!result.ok && (result.status === 401 || result.status === 403)) {
      clearTokens();
      setUser(null);
      setLoading(false);
      return;
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

      // The profile fetch is the "get": it already carries stellarAddress, so the
      // create call only happens when there is genuinely no wallet. Gated on the
      // customer role — galleries and admins have no collector wallet.
      if (profile?.role === "customer" && !profile.stellarAddress) {
        void provisionWallet(profile.id ? String(profile.id) : "");
      }

      const userKey = profile?.id ? String(profile.id) : profile?.email ? String(profile.email) : null;
      if (userKey) {
        void mergeSavedOnLogin(userKey);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [provisionWallet]);

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
