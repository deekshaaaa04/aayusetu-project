import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'aayusetu_active_user';

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved user from storage:', e);
    }
    return {
      id: 'usr_patient_1',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      role: 'PATIENT',
      village: 'Rampur',
      district: 'Medak'
    };
  });

  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const setUser = (userData) => {
    setUserState(userData);
    try {
      if (userData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save user to storage:', e);
    }
  };

  useEffect(() => {
    fetchDemoAccounts();
  }, []);

  const fetchDemoAccounts = async () => {
    try {
      const res = await fetch('/api/auth/demo-accounts');
      const data = await res.json();
      if (data.success) {
        setDemoAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to fetch demo accounts:', err);
    }
  };

  const loginWithRole = (targetRole) => {
    if (!targetRole) return null;
    const roleStr = typeof targetRole === 'object' ? targetRole.role : targetRole;
    const matched = demoAccounts.find(a => a.role === roleStr);
    if (matched) {
      setUser(matched);
      return matched;
    }
    return null;
  };

  const loginWithCredentials = async (mobile, otp, password, role) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, password, role })
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, message: 'Server communication error.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, demoAccounts, loginWithRole, loginWithCredentials, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
