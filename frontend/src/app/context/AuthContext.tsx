import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "../utils/api";
export type UserRole = "public" | "admin";
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}
interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("swaraj_user");
    return stored ? JSON.parse(stored) : null;
  });
  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login/", { email, password });
    localStorage.setItem("swaraj_token", data.token);
    localStorage.setItem("swaraj_user", JSON.stringify(data.user));
    setUser(data.user);
  };
  const signup = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/signup/", { name, email, password });
    localStorage.setItem("swaraj_token", data.token);
    localStorage.setItem("swaraj_user", JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem("swaraj_token");
    localStorage.removeItem("swaraj_user");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
