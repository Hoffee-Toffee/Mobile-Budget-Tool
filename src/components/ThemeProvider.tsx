import { createContext, useContext, ReactNode, useMemo } from 'react';

// Define separate color sets for light and dark themes
const lightColors = {
  primary: '#4CAF50',
  secondary: '#FF5722',
  background: '#FFFFFF',
  text: '#212121',
  border: '#E0E0E0',
  green: '#4CAF50',
  teal: '#009688',
  yellow: '#FFEB3B',
  orange: '#FF9800',
  red: '#F44336',
};

const darkColors = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  background: '#212121',
  text: '#FFFFFF',
  border: '#373737',
  green: '#4CAF50',
  teal: '#03DAC5',
  yellow: '#FFEB3B',
  orange: '#FF9800',
  red: '#F44336',
};

const baseTheme = {
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
};

export const getTheme = (mode: 'light' | 'dark' = 'light') => ({
  ...baseTheme,
  colors: (mode === 'dark' ? darkColors : lightColors)
});

export const ThemeContext = createContext(getTheme('light'));

export const ThemeProvider = ({
  children,
  mode = 'light',
}: {
  children: ReactNode;
  mode?: 'light' | 'dark';
}) => {
  const theme = useMemo(() => getTheme(mode), [mode]);
  console.log(theme)
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
