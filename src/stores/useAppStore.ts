import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  isMobile: boolean;
  setAuthenticated: (val: boolean) => void;
  setSidebarOpen: (val: boolean) => void;
  setIsMobile: (val: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: sessionStorage.getItem('haccp_auth') === 'true',
  sidebarOpen: true,
  isMobile: window.innerWidth < 768,
  setAuthenticated: (val) => {
    if (val) {
      sessionStorage.setItem('haccp_auth', 'true');
    } else {
      sessionStorage.removeItem('haccp_auth');
    }
    set({ isAuthenticated: val });
  },
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  setIsMobile: (val) => set({ isMobile: val, sidebarOpen: !val }),
  logout: () => {
    sessionStorage.removeItem('haccp_auth');
    set({ isAuthenticated: false });
  },
}));
