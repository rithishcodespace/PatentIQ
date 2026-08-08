import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, loginUser, registerUser, logoutUser } from "../services/api";
import type { UserProfile } from "../types/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  checkAuthSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const checkAuthSession = async () => {
    setLoading(true);
    try {
      const me = await getCurrentUser();
      if (me) {
        setUser({
          id: me.id,
          email: me.email,
          fullName: me.name || me.fullName || me.email.split("@")[0],
          role: "User",
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn("[AuthContext] Session check error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    const userObj = res?.data?.user || res?.user;
    if (userObj) {
      setUser({
        id: userObj.id,
        email: userObj.email,
        fullName: userObj.name || userObj.fullName || email.split("@")[0],
        role: "User",
      });
      setIsAuthModalOpen(false);
    } else {
      throw new Error("Invalid response payload from login endpoint");
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await registerUser(email, password, name || email.split("@")[0]);
    const userObj = res?.data?.user || res?.user;
    if (userObj) {
      setUser({
        id: userObj.id,
        email: userObj.email,
        fullName: userObj.name || userObj.fullName || name || email.split("@")[0],
        role: "User",
      });
      setIsAuthModalOpen(false);
    } else {
      throw new Error("Invalid response payload from register endpoint");
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("[AuthContext] Logout failed on server:", err);
    } finally {
      setUser(null);
      setIsAuthModalOpen(false);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        checkAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
