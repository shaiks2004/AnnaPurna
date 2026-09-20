'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  clearTokens,
  getAccessToken,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  type Me,
  type Role,
} from './api';

export type AuthContextValue = {
  user: Me | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<Me | null>;
  hasRole: (role: Role) => boolean;
  hasGlobalRole: (role: Role) => boolean;
  hasOrgRole: (orgId: string, role: Role) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      const token = getAccessToken();
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        await refreshUser();
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void initAuth();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await apiLogin(email, password);
      const me = await getMe();
      setUser(me);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to sign in';
      setError(message);
      throw cause;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const hasGlobalRole = useCallback(
    (role: Role) => {
      return user?.globalRoles?.includes(role) ?? false;
    },
    [user],
  );

  const hasOrgRole = useCallback(
    (orgId: string, role: Role) => {
      if (!user?.organizationRoles) return false;
      const roles = user.organizationRoles[orgId];
      return roles ? roles.includes(role) : false;
    },
    [user],
  );

  const hasRole = useCallback(
    (role: Role) => {
      if (!user) return false;
      if (user.globalRoles?.includes(role)) return true;
      if (user.organizationRoles) {
        return Object.values(user.organizationRoles).some((roles) => roles.includes(role));
      }
      return false;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      refreshUser,
      hasRole,
      hasGlobalRole,
      hasOrgRole,
    }),
    [user, loading, error, login, logout, refreshUser, hasRole, hasGlobalRole, hasOrgRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
