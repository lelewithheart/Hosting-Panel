"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Subscription = { plan: string; active: boolean } | null | undefined;
type User = { id: number | string; email: string; subscription?: Subscription } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const safeParseJson = async (res: Response) => {
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        return await res.json();
      }
      const text = await res.text();
      return { error: text || res.statusText || "Unexpected response" };
    } catch (e: any) {
      return { error: e?.message || "Failed to parse response" };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data?.token) {
        try { localStorage.setItem("token", data.token); } catch {}
        setUser(data.user);
      } else if (!res.ok && !data?.error) {
        return { error: `Login failed (${res.status})` };
      }
      return data;
    } catch (e: any) {
      return { error: e?.message || "Network error" };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data?.token) {
        try { localStorage.setItem("token", data.token); } catch {}
        setUser(data.user);
      } else if (!res.ok && !data?.error) {
        return { error: `Registration failed (${res.status})` };
      }
      return data;
    } catch (e: any) {
      return { error: e?.message || "Network error" };
    }
  };

  const logout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    try { localStorage.removeItem("token"); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};