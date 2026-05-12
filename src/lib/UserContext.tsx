"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getProfile, getAccessToken, UserProfile } from "@/lib/auth-service";

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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const result = await getProfile();
    if (result.ok && result.data) {
      // The API may nest the profile under result.data.data or result.data directly
      const profile = (result.data as unknown as { data?: UserProfile })?.data || result.data;
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
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
