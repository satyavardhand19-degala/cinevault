import { create } from 'zustand';

interface User { _id: string; name: string; email: string; }

interface UserState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: localStorage.getItem('userToken') || null,
  user: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null,

  login: (token, user) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userInfo', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    set({ token: null, user: null });
  },

  isLoggedIn: () => {
    const { token } = get();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch { return false; }
  }
}));
