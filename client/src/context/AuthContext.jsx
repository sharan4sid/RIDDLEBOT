// client/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('prahelika_token'));
  const [loading, setLoading] = useState(true);

  // Check token on initial load
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch (error) {
          console.error('Session restore failed:', error);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem('prahelika_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await api.register({ name, email, password });
    localStorage.setItem('prahelika_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('prahelika_token');
    setToken(null);
    setUser(null);
  }

  function updateUserState(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUserState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
