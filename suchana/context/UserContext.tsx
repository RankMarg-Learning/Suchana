import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types/exam';
import { getUser } from '@/services/userService';

interface UserContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setUser: (u: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userId: null,
  isLoading: true,
  isOnboarded: false,
  setUser: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@suchana_userId');
        if (stored) {
          setUserId(stored);
          const u = await getUser(stored);
          setUserState(u);
        }
      } catch (_) {
        // ignore; will show onboarding
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setUser = (u: User) => {
    setUserState(u);
    setUserId(u.id);
    AsyncStorage.setItem('@suchana_userId', u.id);
  };

  const refreshUser = async () => {
    if (!userId) return;
    const u = await getUser(userId);
    setUserState(u);
  };

  const logout = () => {
    setUserState(null);
    setUserId(null);
    AsyncStorage.removeItem('@suchana_userId');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userId,
        isLoading,
        isOnboarded: !!user,
        setUser,
        logout,
        refreshUser,
      }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
