import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
} from "../services/auth";
import type { AuthUser } from "../types/auth";

type AuthContextType = {
  user: AuthUser | null;
  login: (googleToken: string) => Promise<void>;
  emailLogin: (email: string, password: string) => Promise<void>;
  emailRegister: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "easylearn_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  function saveUser(data: AuthUser) {
    const nextUser: AuthUser = {
      user_id: data.user_id,
      email: data.email,
      picture: data.picture ?? null,
    };

    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  }

  async function login(googleToken: string) {
    setIsLoading(true);

    try {
      const data = await loginWithGoogle(googleToken);
      saveUser(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function emailLogin(email: string, password: string) {
    setIsLoading(true);

    try {
      const data = await loginWithEmail(email, password);
      saveUser(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function emailRegister(email: string, password: string) {
    setIsLoading(true);

    try {
      const data = await registerWithEmail(email, password);
      saveUser(data);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      user,
      login,
      emailLogin,
      emailRegister,
      logout,
      isLoading,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}