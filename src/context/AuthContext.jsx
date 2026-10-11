import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lms_token') || null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      showToast('Session expired. Please log in again.', 'error');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (token) {
      api.auth.getMe()
        .then(userData => {
          setUser(prev => ({ ...(prev || {}), ...userData }));
          localStorage.setItem('lms_user', JSON.stringify(userData));
        })
        .catch(() => {
          // Token invalid or backend unreachable
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await api.auth.login(credentials);
    const userInfo = {
      id: data.id,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };
    localStorage.setItem('lms_token', data.token);
    localStorage.setItem('lms_user', JSON.stringify(userInfo));
    setToken(data.token);
    setUser(userInfo);
    showToast(`Welcome back, ${data.fullName}!`);
    return userInfo;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
    showToast('Logged out successfully');
  };

  const value = {
    user,
    token,
    role: user?.role,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    showToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
