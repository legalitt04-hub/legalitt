import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('legalitt_token');
    const stored = localStorage.getItem('legalitt_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch (_) {}
      authAPI.getMe()
        .then(res => { setUser(res.data.user); localStorage.setItem('legalitt_user', JSON.stringify(res.data.user)); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveSession = (token, user) => {
    localStorage.setItem('legalitt_token', token);
    localStorage.setItem('legalitt_user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    saveSession(res.data.token, res.data.user);
    toast.success('Welcome to Legalitt! 🎉');
    return res.data;
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    saveSession(res.data.token, res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data;
  };

  const googleLogin = async (idToken) => {
    const res = await authAPI.googleAuth(idToken);
    saveSession(res.data.token, res.data.user);
    toast.success(`Welcome, ${res.data.user.name}!`);
    return res.data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('legalitt_token');
    localStorage.removeItem('legalitt_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, googleLogin, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
