import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  background: string;
  text: string;
  cardBackground: string;
  border: string;
  primary: string;
  secondary: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const lightColors: ThemeColors = {
  background: '#ffffff',
  text: '#333333',
  cardBackground: '#f8f9fa',
  border: '#e9ecef',
  primary: '#6200ee',
  secondary: '#03dac6',
};

const darkColors: ThemeColors = {
  background: '#121212',
  text: '#e0e0e0',
  cardBackground: '#1e1e1e',
  border: '#333333',
  primary: '#bb86fc',
  secondary: '#03dac6',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  isDarkMode: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(Appearance.getColorScheme() || 'light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme || 'light');
    });
    return () => subscription.remove();
  }, []);

  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);