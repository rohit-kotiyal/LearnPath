import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { User, LoginData, RegisterData, AuthResponse } from '../types/user';
import { STORAGE_KEYS } from '../utils/constants';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

// Export the context so the hook file can import it
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

  if (!token) {
    setIsLoading(false);
    return;
  }

  // 🔥 SAFE hydration
  if (savedUser && savedUser !== "undefined") {
    try {
      setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error("Invalid user in localStorage:", savedUser);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  try {
    const userData = await authApi.getCurrentUser();
    setUser(userData);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

  const login = async (data: LoginData) => {
  setIsLoading(true);
  try {
    const response: AuthResponse = await authApi.login(data);

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);

    const userData = await authApi.getCurrentUser();
    setUser(userData);

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(userData)
    );

    const pending = localStorage.getItem('pending_join');

    if (pending) {
      const { sessionId, passkey } = JSON.parse(pending);
      localStorage.removeItem('pending_join');

      navigate(`/join?sessionId=${sessionId}&passkey=${passkey}`);
    } else {
      navigate('/dashboard');
    }

  } finally {
    setIsLoading(false);
  }
};

  const register = async (data: RegisterData) => {
    await authApi.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}