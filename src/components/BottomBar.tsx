import { View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';
import { useTheme } from './ThemeProvider';

import { initialData } from '../hooks/useBudgetData';

const BottomBar = () => {
  const { setBudgetData } = useContext(BudgetContext);
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', padding: theme.spacing.medium, borderTopWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background }}>
      <IconButton
        icon="restore"
        size={28}
        onPress={() => setBudgetData(initialData)}
        style={{
          borderRadius: 5,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 4,
          marginRight: 8,
        }}
        iconColor={theme.colors.text}
        accessibilityLabel="Reset Budget"
      />
    </View>
  );
};

export default BottomBar;