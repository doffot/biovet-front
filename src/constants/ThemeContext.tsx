import React, { createContext, useEffect, useState, type ReactNode, } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Intentar leer de localStorage
    const savedTheme = localStorage.getItem("LABVET_THEME") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // 2. Si no hay guardado, detectar preferencia del sistema
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }

    // 3. Por defecto: oscuro
    return "dark";
  });

  // Aplicar tema al DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("LABVET_THEME", theme);
  }, [theme]);

  // Escuchar cambios en preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo aplicar si el usuario no ha elegido manualmente
      const savedTheme = localStorage.getItem("LABVET_THEME");
      if (!savedTheme) {
        setThemeState(e.matches ? "light" : "dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};