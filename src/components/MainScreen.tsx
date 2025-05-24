import { useContext } from 'react';
import { View, Text } from 'react-native';
import { theme } from './ThemeProvider';
import TopBar from './TopBar';
import BudgetEditor from './BudgetEditor';
import BottomBar from './BottomBar';
import { BudgetContext } from '../context/BudgetContext';

const MainScreen = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);

  if (!budgetData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // useEffect(() => {
  //   setBudgetData((prevData) => {
  //     if (!prevData || !prevData.settings) return prevData;
  //     const newTheme = isDarkMode ? 'dark' : 'light';
  //     // Only update if values have changed
  //     if (
  //       prevData.settings.title === budgetTitle &&
  //       prevData.settings.theme === newTheme
  //     ) {
  //       return prevData;
  //     }
  //     return {
  //       ...prevData,
  //       settings: {
  //         ...prevData.settings,
  //         title: budgetTitle,
  //         theme: newTheme,
  //       },
  //     };
  //   });
  // }, [budgetTitle, isDarkMode, setBudgetData]);

  const backgroundColor = theme.colors.background;

  return (
    <View style={{ padding: theme.spacing.medium, backgroundColor }}>
      <TopBar />
      <BudgetEditor />
      <BottomBar />
    </View>
  );
};

export default MainScreen;