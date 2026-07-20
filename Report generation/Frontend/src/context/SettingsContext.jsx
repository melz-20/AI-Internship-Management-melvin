/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "internship-hub-settings";
export const defaultSettings = { theme: "Light", fontSize: "Medium", emailNotifications: true, dashboardNotifications: true, reportNotifications: true, dashboardAutoRefresh: "Off" };
const SettingsContext = createContext(null);

const loadSettings = () => { try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings; } catch { return defaultSettings; } };
const applySettings = (settings) => { document.documentElement.dataset.theme = settings.theme.toLowerCase(); document.documentElement.style.fontSize = settings.fontSize === "Small" ? "14px" : settings.fontSize === "Large" ? "18px" : "16px"; };

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  useEffect(() => { applySettings(settings); }, [settings]);
  const saveSettings = useCallback((nextSettings) => { const normalized = { ...defaultSettings, ...nextSettings, theme: "Light" }; localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)); setSettings(normalized); return normalized; }, []);
  const value = useMemo(() => ({ settings, saveSettings, defaultSettings }), [settings, saveSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() { const context = useContext(SettingsContext); if (!context) throw new Error("useSettings must be used inside SettingsProvider."); return context; }
export { STORAGE_KEY };
