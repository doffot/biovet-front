import { useLayoutStore } from "../store/useLayoutStore";

export const useTheme = () => {
  const theme = useLayoutStore((state) => state.theme);
  const toggleTheme = useLayoutStore((state) => state.toggleTheme);
  const setTheme = useLayoutStore((state) => state.setTheme);
  
  return { 
    theme, 
    toggleTheme, 
    setTheme,
    isDark: theme === 'dark' 
  };
};