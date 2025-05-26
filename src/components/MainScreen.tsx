import { useContext } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from './ThemeProvider';
import TopBar from './TopBar';
import BudgetEditor from './BudgetEditor';
import BottomBar from './BottomBar';
import { BudgetContext } from '../context/BudgetContext';

const MainScreen = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);
  const theme = useTheme();

  if (!budgetData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

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