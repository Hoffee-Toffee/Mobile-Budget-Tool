
import { View, Text } from 'react-native';
import { Button, IconButton, Menu } from 'react-native-paper';
import { useContext, useState } from 'react';
import { BudgetContext } from '../context/BudgetContext';
import { useTheme } from './ThemeProvider';
import { periodData } from '../utils/formatters';
import { initialData } from '../hooks/useBudgetData';



const BottomBar = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);
  const theme = useTheme();
  const outputPeriod = budgetData?.settings?.outputPeriod || 'w';
  const [showOutputPeriodMenu, setShowOutputPeriodMenu] = useState(false);

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
      {/* Output Period Dropdown */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
        <Text style={{ color: theme.colors.text, marginRight: 8, fontWeight: 'bold' }}>Output Period:</Text>
        <Menu
          visible={showOutputPeriodMenu}
          onDismiss={() => setShowOutputPeriodMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowOutputPeriodMenu(true)}
              style={{ borderRadius: 5, height: 40, width: 120, backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 }}
              contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', height: 40 }}
              labelStyle={{ marginLeft: 10, color: theme.colors.text, fontWeight: 'bold', flex: 1, textAlign: 'left', textTransform: 'capitalize' }}
              icon="chevron-down"
              textColor={theme.colors.text}
            >
              {typeof outputPeriod === 'string' && periodData[outputPeriod]?.label ? periodData[outputPeriod].label.charAt(0).toUpperCase() + periodData[outputPeriod].label.slice(1) : 'Select period'}
            </Button>
          }
          style={{ width: 120, marginTop: 0, backgroundColor: theme.colors.background }}
          contentStyle={{ backgroundColor: theme.colors.background }}
        >
          {Object.entries(periodData).map(([key, val]) => (
            <Menu.Item
              key={key}
              onPress={() => {
                setBudgetData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    outputPeriod: key,
                  },
                }));
                setShowOutputPeriodMenu(false);
              }}
              title={val.label.charAt(0).toUpperCase() + val.label.slice(1)}
              titleStyle={{ color: theme.colors.text }}
              style={{ backgroundColor: theme.colors.background }}
            />
          ))}
        </Menu>
      </View>
    </View>
  );
};

export default BottomBar;