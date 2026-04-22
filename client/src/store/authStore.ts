import { create } from 'zustand';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  admin: Admin | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('adminToken') || null,
  admin: localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')!) : null,
  
  login: (token, admin) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminInfo', JSON.stringify(admin));
    set({ token, admin });
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    set({ token: null, admin: null });
  },
  
  isTokenValid: () => {
    const { token } = get();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }
}));
