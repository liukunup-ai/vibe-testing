import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_MODE_KEY = 'app-theme-mode';
const COMPACT_MODE_KEY = 'app-compact-mode';
const HAPPY_MODE_KEY = 'app-happy-mode';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  compactMode: boolean;
  happyMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setCompactMode: (enabled: boolean) => void;
  setHappyMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getStoredThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(THEME_MODE_KEY);
  const validModes: ThemeMode[] = ['light', 'dark', 'auto'];
  if (stored && validModes.includes(stored as ThemeMode)) {
    return stored as ThemeMode;
  }
  return 'auto';
};

const getStoredBoolean = (key: string): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) === 'true';
};

const getEffectiveTheme = (themeMode: ThemeMode): 'light' | 'dark' => {
  if (themeMode === 'auto') {
    return getSystemTheme();
  }
  return themeMode;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode);
  const [compactMode, setCompactModeState] = useState<boolean>(() => getStoredBoolean(COMPACT_MODE_KEY));
  const [happyMode, setHappyModeState] = useState<boolean>(() => getStoredBoolean(HAPPY_MODE_KEY));
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    return getEffectiveTheme(getStoredThemeMode());
  });

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
    setEffectiveTheme(getEffectiveTheme(mode));
  }, []);

  const setCompactMode = useCallback((enabled: boolean) => {
    setCompactModeState(enabled);
    localStorage.setItem(COMPACT_MODE_KEY, String(enabled));
  }, []);

  const setHappyMode = useCallback((enabled: boolean) => {
    setHappyModeState(enabled);
    localStorage.setItem(HAPPY_MODE_KEY, String(enabled));
  }, []);

  useEffect(() => {
    if (themeMode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setEffectiveTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      effectiveTheme, 
      compactMode, 
      happyMode,
      setThemeMode, 
      setCompactMode,
      setHappyMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
