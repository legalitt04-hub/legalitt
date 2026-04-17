import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI, TOKEN_KEY, REFRESH_KEY } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOADING': return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOADED':
      return { ...state, isLoading: false };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // On app start — restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) return dispatch({ type: 'LOADED' });

        const { data } = await authAPI.getMe();
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.data });
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        dispatch({ type: 'LOADED' });
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authAPI.login({ email, password });
      await SecureStore.setItemAsync(TOKEN_KEY, data.data.accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, data.data.refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.data.user });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'ERROR', payload: msg });
      return { success: false, message: msg };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authAPI.register(userData);
      await SecureStore.setItemAsync(TOKEN_KEY, data.data.accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, data.data.refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.data.user });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'ERROR', payload: msg });
      return { success: false, message: msg };
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authAPI.googleAuth(idToken);
      await SecureStore.setItemAsync(TOKEN_KEY, data.data.accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, data.data.refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.data.user });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed';
      dispatch({ type: 'ERROR', payload: msg });
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      await authAPI.logout(refreshToken);
    } catch { /* ignore */ }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((data) => {
    dispatch({ type: 'UPDATE_USER', payload: data });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
