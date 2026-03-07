import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

interface User {
  id: string;
  _id: string;
  alias: string;
  handle: string;
  avatar: string;
  status: string;
  frequency: string;
  joinedRooms: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (alias: string, passkey: string) => Promise<void>;
  register: (alias: string, passkey: string, frequency?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cw_token'));
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and fetch user
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data);
          socketService.connect(token);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('cw_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (alias: string, passkey: string) => {
    const res = await authAPI.login(alias, passkey);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('cw_token', newToken);
    setToken(newToken);
    setUser(userData);
    socketService.connect(newToken);
  };

  const register = async (alias: string, passkey: string, frequency?: string) => {
    const res = await authAPI.register(alias, passkey, frequency);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('cw_token', newToken);
    setToken(newToken);
    setUser(userData);
    socketService.connect(newToken);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    socketService.disconnect();
    localStorage.removeItem('cw_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      setUser(res.data);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
