import { View, Text, ScrollView } from 'react-native';
import { theme } from './ThemeProvider';
import ItemEditor from './ItemEditor';
import { capitalize, formatCurrency } from '../utils/formatters';
import { processCalculation } from '../utils/calculations';
import { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';

const BudgetEditor = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);

  if (!budgetData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  let sections = Object.entries(budgetData).filter(([key]) => key !== 'settings');

  return (
    <ScrollView>
      {sections.map(([section, items]) =>
        <View key={section}>
          <Text style={{ fontSize: theme.fontSizes.large }}>{capitalize(section)}</Text>
          <Text>Item / Active / Calculation</Text>
          {items.map((item: any) => (
            <ItemEditor key={item.name} item={item} setBudgetData={setBudgetData} />
          ))}
          <Text>Add Item</Text>
          <Text>Total: {formatCurrency(items.reduce((total, item) => total + processCalculation(item).res, 0))}</Text>
        </View>
      )};
    </ScrollView>
  );
};

export default BudgetEditor;