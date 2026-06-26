import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        const { data } = await api.get('/auth/me');
        set({ user: data, isAuthenticated: true });
      }
    } catch {}
    finally { set({ isLoading: false }); }
  },
}));
