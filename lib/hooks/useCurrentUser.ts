'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, type User } from '@/lib/auth';

interface UseCurrentUserReturn {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

// Module-level cache so multiple components share one fetch per page load
let cachedUser: User | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 60s

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser]       = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(!cachedUser);

  useEffect(() => {
    const now = Date.now();
    if (cachedUser && now - cacheTime < CACHE_TTL) {
      setUser(cachedUser);
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then((u) => {
        cachedUser = u;
        cacheTime  = Date.now();
        setUser(u);
      })
      .catch(() => {
        cachedUser = null;
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { user, isLoading, isLoggedIn: !!user };
}

/** Call this on logout to bust the cache */
export function clearUserCache() {
  cachedUser = null;
  cacheTime  = 0;
}
