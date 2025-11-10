import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
  };
}

const lightColors = {
  background: '#ffffff',
  foreground: '#111827',
  card: '#ffffff',
  cardForeground: '#111827',
  primary: '#2563eb',
  primaryForeground: '#ffffff',
  secondary: '#f3f4f6',
  secondaryForeground: '#111827',
  muted: '#f9fafb',
  mutedForeground: '#6b7280',
  accent: '#f3f4f6',
  accentForeground: '#111827',
  border: '#e5e7eb',
  input: '#ffffff',
  ring: '#2563eb',
  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
};

const darkColors = {
  background: '#0f172a',
  foreground: '#f1f5f9',
  card: '#1e293b',
  cardForeground: '#f1f5f9',
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  secondary: '#1e293b',
  secondaryForeground: '#f1f5f9',
  muted: '#1e293b',
  mutedForeground: '#94a3b8',
  accent: '#1e293b',
  accentForeground: '#f1f5f9',
  border: '#334155',
  input: '#1e293b',
  ring: '#3b82f6',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('themeMode');
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (err) {
      console.error('Error loading theme preference:', err);
    }
  };

  const updateTheme = () => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  };

  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeModeState(newMode);
    try {
      await AsyncStorage.setItem('themeMode', newMode);
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, setThemeMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

