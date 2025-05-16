import React from 'react';
import { SafeAreaView } from 'react-native';
import BudgetTool from './components/BudgetTool';
import { ThemeProvider } from './styles/Theme';

const App = () => {
  return (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <BudgetTool />
      </SafeAreaView>
    </ThemeProvider>
  );
};

export default App;