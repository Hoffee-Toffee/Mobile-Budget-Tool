import React, { useState, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from './components/ThemeProvider';
import MainScreen from './components/MainScreen';
import { Provider } from 'react-native-paper';
import useBudgetData from './hooks/useBudgetData';
import { BudgetContext } from './context/BudgetContext';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider mode={themeMode}>
        <Provider>
          <SafeAreaProvider>
            <BudgetContext.Provider value={{ budgetData, setBudgetData, ...themeContextValue }}>
              <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'bottom', 'left']}>
                <MainScreen />
              </SafeAreaView>
            </BudgetContext.Provider>
          </SafeAreaProvider>
        </Provider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;