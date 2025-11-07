import { useState, useEffect } from 'react';
import { getUserInfo } from '../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  walletBalance?: number;
  // Add other user properties as needed
}

interface UseUserInfoReturn {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserInfo = (): UseUserInfoReturn => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await getUserInfo();
      const userData = response.data;
      
      // Store user info in AsyncStorage for persistence
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      console.error('Error fetching user info:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch user info');
      
      // If token is invalid, clear it
      if (err?.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchUserInfo();
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return {
    user,
    loading,
    error,
    refetch,
  };
};

