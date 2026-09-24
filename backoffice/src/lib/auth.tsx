import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Navigate } from "react-router-dom";
import {
  clearSession,
  getStoredUser,
  loginRequest,
  setSession,
} from "@/lib/data";
import type { Role, User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  async function login(email: string, password: string): Promise<User> {
    const result = await loginRequest(email, password);
    setSession(result.accessToken, result.user);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}