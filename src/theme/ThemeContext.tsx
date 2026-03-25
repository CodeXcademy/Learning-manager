import React, { createContext, useContext, useEffect, ReactNode, useState, useCallback } from 'react';
import { ThemeName, getTheme, applyThemeColors } from './themes';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: ThemeName = 'void';

/**
 * ThemeProvider component
 * Wraps the app and provides theme context
 * Handles theme persistence to localStorage
 * Prevents flash of unstyled content (FOUC) by loading theme before render
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from localStorage on mount (before render)
  useEffect(() => {
    // Check if we have a saved theme preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    const themeToUse = (savedTheme && ['void', 'ocean', 'forest', 'sunset'].includes(savedTheme))
      ? savedTheme
      : DEFAULT_THEME;

    // Apply theme immediately
    const themeConfig = getTheme(themeToUse);
    applyThemeColors(themeConfig.colors);

    // Update state
    setCurrentThemeState(themeToUse);
    setIsInitialized(true);
  }, []);

  // Update theme when user selects a new one
  const setTheme = useCallback((newTheme: ThemeName) => {
    const themeConfig = getTheme(newTheme);

    // Apply CSS variables
    applyThemeColors(themeConfig.colors);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Update state
    setCurrentThemeState(newTheme);
  }, []);

  // Prevent rendering until theme is initialized (avoid FOUC)
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}