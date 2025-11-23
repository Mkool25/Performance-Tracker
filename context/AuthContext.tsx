import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const session = localStorage.getItem('perf-tracker-session');
    if (session) {
      const users = JSON.parse(localStorage.getItem('perf-tracker-users') || '[]');
      const foundUser = users.find((u: User) => u.id === session);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('perf-tracker-users') || '[]');
    // Simple password check (In real app, hash passwords!)
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      // Remove password from state
      const { password: _, ...userWithoutPass } = foundUser;
      setUser(userWithoutPass);
      localStorage.setItem('perf-tracker-session', foundUser.id);
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('perf-tracker-users') || '[]');
    
    if (users.some((u: any) => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      password, // In a real app, never store plain text passwords
      joinedAt: new Date().toISOString()
    };

    // SAVE & MIGRATE DATA
    // If there was previous "guest" data (stored under 'perf-tracker-data'), 
    // migrate it to this new user to save progress.
    const guestData = localStorage.getItem('perf-tracker-data');
    if (guestData) {
      localStorage.setItem(`perf-tracker-data-${newUser.id}`, guestData);
      // Optional: Clear guest data to avoid confusion, or keep it as backup.
      // localStorage.removeItem('perf-tracker-data'); 
    }

    users.push(newUser);
    localStorage.setItem('perf-tracker-users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPass } = newUser;
    setUser(userWithoutPass);
    localStorage.setItem('perf-tracker-session', newUser.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('perf-tracker-session');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};