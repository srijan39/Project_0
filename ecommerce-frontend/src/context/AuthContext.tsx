import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../api/auth";
import type {
  AuthUser,
  LoginCredentials,
  RegisterPayload,
  UserRole,
} from "../api/auth";
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredSession,
} from "../api/client";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  const clearSessionState = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      clearSessionState();
      return null;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setToken(storedToken);
      setStoredSession(storedToken, currentUser);
      return currentUser;
    } catch {
      clearSessionState();
      return null;
    }
  }, [clearSessionState]);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (isActive) {
          clearSessionState();
          setLoading(false);
        }
        return;
      }

      const currentUser = await refreshUser();

      if (isActive) {
        setUser(currentUser);
        setToken(currentUser ? storedToken : null);
        setLoading(false);
      }
    };

    restoreSession();

    return () => {
      isActive = false;
    };
  }, [clearSessionState, refreshUser]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      setLoading(false);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginUser(credentials);

    setStoredSession(response.token, response.user);
    setUser(response.user);
    setToken(response.token);

    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await registerUser(payload);

    setStoredSession(response.token, response.user);
    setUser(response.user);
    setToken(response.token);

    return response.user;
  }, []);

  const logout = useCallback(() => {
    clearSessionState();
  }, [clearSessionState]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false;

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
    }),
    [user, token, loading, login, register, logout, refreshUser, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
