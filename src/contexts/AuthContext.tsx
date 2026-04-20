/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  companyId: string | null;
  forcePasswordChange: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function getClientCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userDataCookie = getClientCookie('user_data');
    
    if (userDataCookie) {
      try {
        let decodedStr = decodeURIComponent(userDataCookie);
        if (decodedStr.startsWith('%7B') || decodedStr.startsWith('%22')) {
          decodedStr = decodeURIComponent(decodedStr);
        }
        setUser(JSON.parse(decodedStr));
      } catch (error) {
        console.error("Erro ao ler sessão do cookie.");
        document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUser(null);
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    
    // Usar transition ou delay para evitar race condition no Next App Router
    setTimeout(() => {
      router.push("/");
      setTimeout(() => router.refresh(), 100);
    }, 0);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);