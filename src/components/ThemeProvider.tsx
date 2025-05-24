import { createContext, useContext, ReactNode } from 'react';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';

export const theme = {
  colors: {
    primary: '#4CAF50',
    secondary: '#FF5722',
    background: '#FFFFFF', text: '#212121',
    border: '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
    blue: '#2196F3',
  },
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

export const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
