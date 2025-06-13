import React, { useState, useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './components/ThemeProvider';
import MainScreen from './components/MainScreen';
import { Provider } from 'react-native-paper';
import useBudgetData from './hooks/useBudgetData';
import { BudgetContext } from './context/BudgetContext';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWindowDimensions, StyleSheet } from 'react-native';
import ScreenWrapper from './components/ScreenWrapper';
import MealPlannerScreen from './components/MealPlannerScreen';

const App = () => {
  const { budgetData, setBudgetData } = useBudgetData();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'budget', title: 'Budget' },
    { key: 'mealPlanner', title: 'Meal Planner' },
  ]);

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

  const renderScene = SceneMap({
    budget: () => (
      <ScreenWrapper>
        <MainScreen />
      </ScreenWrapper>
    ),
    mealPlanner: () => (
      <ScreenWrapper>
        <MealPlannerScreen />
      </ScreenWrapper>
    ),
  });

  return (
    <ThemeProvider mode={themeMode}>
      <Provider>
        <SafeAreaProvider>
          <BudgetContext.Provider value={{ budgetData, setBudgetData, ...themeContextValue }}>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}
              renderTabBar={props => (
                <TabBar
                  {...props}
                  style={styles.tabBar}
                  indicatorStyle={styles.indicator}
                  labelStyle={styles.label}
                />
              )}
            />
          </BudgetContext.Provider>
        </SafeAreaProvider>
      </Provider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#6200ee', // Example primary color
  },
  indicator: {
    backgroundColor: '#ffffff', // Example accent color
  },
  label: {
    fontWeight: 'bold',
  },
});

export default App;