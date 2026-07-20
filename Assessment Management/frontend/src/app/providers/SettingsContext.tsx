import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppSettings } from '../../types/settings';
import { defaultSettings } from '../../services/mock/data/seed';

const STORAGE_KEY = 'app-settings';

function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(stored) } as AppSettings;
  } catch {
    return defaultSettings;
  }
}

function applyTheme(theme: AppSettings['theme']) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
    return;
  }

  if (theme === 'light') {
    html.classList.remove('dark');
    return;
  }

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark) html.classList.add('dark');
  else html.classList.remove('dark');
}

const SettingsContext = createContext<{
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}>({
  settings: defaultSettings,
  updateSettings: () => undefined,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    applyTheme(settings.theme);
  }, [settings]);

  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener?.('change', handleChange);

    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, [settings.theme]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
