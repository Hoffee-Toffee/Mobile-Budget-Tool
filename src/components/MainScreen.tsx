import { useContext } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Add SafeAreaView
import { useTheme } from 'react-native-paper'; // Changed import
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
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'left', 'right']}> {/* Respect top inset, ignore bottom */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20} // Adjust for TopBar and spacing
      >
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.medium,
            paddingBottom: 0,
          }}
        >
          <TopBar />
          <BudgetEditor />
          <BottomBar /> {/* App's BottomBar is scrollable */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MainScreen;