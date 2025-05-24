import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from './components/ThemeProvider';
import MainScreen from './components/MainScreen';
import { Provider } from 'react-native-paper';
import useBudgetData from './hooks/useBudgetData';
import { BudgetContext } from './context/BudgetContext';

const App = () => {
  const { budgetData, setBudgetData } = useBudgetData();

  return (
    <ThemeProvider>
      <Provider>
        <SafeAreaProvider>
          <BudgetContext.Provider value={{ budgetData, setBudgetData }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'bottom', 'left']}>
              <MainScreen />
            </SafeAreaView>
          </BudgetContext.Provider>
        </SafeAreaProvider>
      </Provider>
    </ThemeProvider>
  );
};

export default App;