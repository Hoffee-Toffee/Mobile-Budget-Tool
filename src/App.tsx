import React, { useState, useMemo } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from './components/ThemeProvider';
import MainScreen from './components/MainScreen';
import { Provider } from 'react-native-paper';
import useBudgetData from './hooks/useBudgetData';
import { BudgetContext } from './context/BudgetContext';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  const { budgetData, setBudgetData } = useBudgetData();

  // Track theme mode in state, default to budgetData.settings.theme or 'light'
  const [themeMode, setThemeMode] = useState(
    budgetData?.settings?.theme === 'dark' ? 'dark' : 'light'
  );

  // Sync themeMode with budgetData.settings.theme if it changes
  React.useEffect(() => {
    if (budgetData?.settings?.theme && budgetData.settings.theme !== themeMode) {
      setThemeMode(budgetData.settings.theme);
    }
  }, [budgetData?.settings?.theme]);

  // Provide a setter for theme mode to children (e.g., TopBar)
  const themeContextValue = useMemo(
    () => ({
      themeMode,
      setThemeMode,
    }),
    [themeMode]
  );

  return (
    <ThemeProvider mode={themeMode}>
      <Provider>
        <SafeAreaProvider>
          <BudgetContext.Provider value={{ budgetData, setBudgetData, ...themeContextValue }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'bottom', 'left']}>
              <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
              <MainScreen />
            </SafeAreaView>
          </BudgetContext.Provider>
        </SafeAreaProvider>
      </Provider>
    </ThemeProvider>
  );
};

export default App;