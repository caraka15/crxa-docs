import { useEffect, useSyncExternalStore } from 'react';

type ThemeValue = 'mylight' | 'mydark';

const DEFAULT_THEME: ThemeValue = 'mylight';
const THEME_STORAGE_KEY = 'theme';

const listeners = new Set<() => void>();

const readStoredTheme = (): ThemeValue => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeValue | null;
  return stored === 'mydark' ? 'mydark' : DEFAULT_THEME;
};

let currentTheme: ThemeValue = readStoredTheme();

const applyThemeToDocument = (value: ThemeValue) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', value);
  }
};

const updateTheme = (value: ThemeValue) => {
  currentTheme = value;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  }
  applyThemeToDocument(value);
  listeners.forEach((listener) => listener());
};

// Ensure the initial theme is set when this module is evaluated on the client.
applyThemeToDocument(currentTheme);

export const useTheme = () => {
  const theme = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentTheme,
    () => DEFAULT_THEME
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Sync with storage changes triggered outside React (e.g., another tab).
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && event.newValue) {
        const nextTheme = event.newValue === 'mydark' ? 'mydark' : DEFAULT_THEME;
        if (nextTheme !== currentTheme) {
          updateTheme(nextTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeValue = theme === 'mylight' ? 'mydark' : 'mylight';
    updateTheme(nextTheme);
  };

  return { theme, toggleTheme };
};
