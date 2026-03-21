import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeContextType = {
  effectiveTheme: 'light' | 'dark';
  compactMode: boolean;
  happyWorkMode: boolean;
  setEffectiveTheme: (theme: 'light' | 'dark') => void;
  setCompactMode: (mode: boolean) => void;
  setHappyWorkMode: (mode: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const getInitialEffectiveTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('app-theme-mode');
  if (stored === 'dark') return 'dark';
  if (stored === 'light') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(getInitialEffectiveTheme);
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('app-compact-mode') === 'true');
  const [happyWorkMode, setHappyWorkMode] = useState(() => localStorage.getItem('app-happy-work') === 'true');

  // Sync with system theme changes
  useEffect(() => {
    const stored = localStorage.getItem('app-theme-mode');
    if (stored !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-theme-mode') {
        const stored = e.newValue;
        if (stored === 'dark') setEffectiveTheme('dark');
        else if (stored === 'light') setEffectiveTheme('light');
        else if (stored === 'auto') {
          setEffectiveTheme(window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
      }
      if (e.key === 'app-compact-mode') {
        setCompactMode(e.newValue === 'true');
      }
      if (e.key === 'app-happy-work') {
        setHappyWorkMode(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSetEffectiveTheme = useCallback((theme: 'light' | 'dark') => {
    setEffectiveTheme(theme);
  }, []);

  const handleSetCompactMode = useCallback((mode: boolean) => {
    setCompactMode(mode);
  }, []);

  const handleSetHappyWorkMode = useCallback((mode: boolean) => {
    setHappyWorkMode(mode);
  }, []);

  return (
    <ThemeContext.Provider value={{
      effectiveTheme,
      compactMode,
      happyWorkMode,
      setEffectiveTheme: handleSetEffectiveTheme,
      setCompactMode: handleSetCompactMode,
      setHappyWorkMode: handleSetHappyWorkMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
