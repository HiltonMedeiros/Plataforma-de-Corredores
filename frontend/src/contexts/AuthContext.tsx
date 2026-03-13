import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  fetchProfile as apiFetchProfile,
  getToken,
  setToken,
  clearToken,
  setStoredUser,
  getStoredUser,
  clearStoredUser,
} from "@/lib/api";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  neighborhood?: string;
  // additional fields from profile
  cpf?: string;
  telefone?: string;
  status_conta?: string;
  comprovante_status?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signUp: (form: FormData, remember: boolean) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return getStoredUser();
  });
  const [isLoading, setIsLoading] = useState(true);

  // If we have a token, refresh profile at start
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiFetchProfile()
      .then((profile) => {
        setUser(profile);
        setStoredUser(profile);
      })
      .catch(() => {
        clearToken();
        clearStoredUser();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string, remember: boolean) => {
    const { token } = await apiLogin(email, password);
    setToken(token);

    const profile = await apiFetchProfile();
    setUser(profile);
    if (remember) {
      setStoredUser(profile);
    }
  };

  const signUp = async (form: FormData, remember: boolean) => {
    const { token, user: registeredUser } = await apiRegister(form);
    setToken(token);

    const profile = await apiFetchProfile();
    setUser(profile);
    if (remember) {
      setStoredUser(profile);
    }

    return registeredUser;
  };

  const signOut = () => {
    setUser(null);
    clearToken();
    clearStoredUser();
  };

  const refreshProfile = async () => {
    const profile = await apiFetchProfile();
    setUser(profile);
    setStoredUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
