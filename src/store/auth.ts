import { create } from 'zustand';

interface User {
  id: string;
  admissionNumber: string;
  role: 'admin' | 'user';
  name: string;
  class: string;
  imageUrl?: string;
  totalUsage: number;
  totalCompensation: number;
  creditBalance: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: (user: User, token: string) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  },
}));