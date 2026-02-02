import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface LayoutState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  
  // Theme
  theme: Theme;
  
  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  
  // Actions - Theme
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

// Función helper para aplicar tema al DOM
const applyThemeToDOM = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Función para obtener tema inicial
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('biovet-layout-storage');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.state?.theme) {
        return parsed.state.theme;
      }
    } catch (e) {
      // Si falla el parse, continuar con la detección
    }
  }
  
  // Fallback: preferencia del sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      theme: 'light', // Se actualizará con initializeTheme
      
      // Sidebar Actions
      toggleSidebar: () => 
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) => 
        set({ sidebarCollapsed: collapsed }),

      toggleMobileSidebar: () => 
        set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),

      closeMobileSidebar: () => 
        set({ sidebarMobileOpen: false }),

      // Theme Actions
      setTheme: (theme: Theme) => {
        applyThemeToDOM(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
        applyThemeToDOM(newTheme);
        set({ theme: newTheme });
      },

      initializeTheme: () => {
        const theme = getInitialTheme();
        applyThemeToDOM(theme);
        set({ theme });
      },
    }),
    {
      name: 'biovet-layout-storage',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme 
      }),
    }
  )
);