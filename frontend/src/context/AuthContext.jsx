import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gulli_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('gulli_user');
      const savedToken = localStorage.getItem('gulli_token');

      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);

          // Verify token validity in background
          authApi.getMe()
            .then((freshUser) => {
              const updatedUser = {
                id: freshUser.id,
                name: freshUser.name || freshUser.fullName,
                fullName: freshUser.fullName,
                username: freshUser.username,
                email: freshUser.email,
                role: freshUser.role,
              };
              setUser(updatedUser);
              localStorage.setItem('gulli_user', JSON.stringify(updatedUser));
            })
            .catch(() => {
              // Token expired or invalid
              localStorage.removeItem('gulli_user');
              localStorage.removeItem('gulli_token');
              setUser(null);
              setToken(null);
            });
        } catch (e) {
          localStorage.removeItem('gulli_user');
          localStorage.removeItem('gulli_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const userInfo = {
      id: data.id,
      name: data.name || data.fullName,
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('gulli_token', data.token);
    localStorage.setItem('gulli_user', JSON.stringify(userInfo));
    setToken(data.token);
    setUser(userInfo);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    const userInfo = {
      id: data.id,
      name: data.name || data.fullName,
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('gulli_token', data.token);
    localStorage.setItem('gulli_user', JSON.stringify(userInfo));
    setToken(data.token);
    setUser(userInfo);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gulli_token');
    localStorage.removeItem('gulli_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
