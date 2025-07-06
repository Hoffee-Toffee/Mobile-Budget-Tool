import React, { useState, useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getTheme } from './src/ThemeProvider'; // Renamed, import getTheme
import MainScreen from './src/MainScreen';
import { Provider as PaperProvider } from 'react-native-paper'; // Renamed
import useBudgetData from './src/hooks/useBudgetData';
import { BudgetContext } from './src/context/BudgetContext';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import ScreenWrapper from './src/ScreenWrapper';
import MealPlannerScreen from './src/MealPlannerScreen';

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

  // Sync themeMode with budgetData.settings.theme if it changes
  React.useEffect(() => {
    if (budgetData?.settings?.theme && budgetData.settings.theme !== themeMode) {
      setThemeMode(budgetData.settings.theme);
    }
  }, [budgetData?.settings?.theme, themeMode]); // Added themeMode to dependencies

  // Generate the theme object based on themeMode
  const currentTheme = useMemo(() => getTheme(themeMode), [themeMode]);

  // budgetContextValue for BudgetContext.Provider
  // Theme related values (themeMode, setThemeMode) will be accessible via react-native-paper's useTheme
  // or our useCustomTheme if CustomThemeProvider remains.
  // For now, simplifying BudgetContext to not redundantly pass themeMode/setThemeMode
  // if they are meant to be sourced from the theme context itself.
  const budgetContextValue = useMemo(
    () => ({
      budgetData,
      setBudgetData,
      // themeMode and setThemeMode are available via currentTheme or dedicated context if needed
      // For components needing to *set* the theme, they'd call a function provided by BudgetContext
      // that eventually calls setThemeMode here. For now, let's assume TopBar might need it.
      themeMode,
      setThemeMode
    }),
    [budgetData, setBudgetData, themeMode, setThemeMode] // Added setThemeMode
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
    <PaperProvider theme={currentTheme}>
      <SafeAreaProvider>
        <BudgetContext.Provider value={budgetContextValue}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={props => (
              <TabBar
                {...props}
                style={{ backgroundColor: currentTheme.colors.primary }} // Use theme from currentTheme
                indicatorStyle={{ backgroundColor: currentTheme.colors.surface }} // Use theme
                labelStyle={{ color: currentTheme.colors.onPrimary, fontWeight: 'bold' }} // Use theme
              />
            )}
          />
        </BudgetContext.Provider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

// const styles = StyleSheet.create({ ... }); // Old styles likely removed or adjusted

export default App;