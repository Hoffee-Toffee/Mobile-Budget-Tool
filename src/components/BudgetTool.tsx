import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Input from './Shared/Input';
import useBudgetData from '../hooks/useBudgetData';
import { formatCurrency } from '../utils/formatters';
import { calculateSummary } from '../utils/calculations';
import { theme } from '../styles/Theme';

const BudgetTool = () => {
  const { budgetData, setBudgetData } = useBudgetData();

  const [budgetTitle, setBudgetTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update local state after budgetData is loaded
  useEffect(() => {
    if (budgetData) {
      setBudgetTitle(budgetData.settings.title);
      setIsDarkMode(budgetData.settings.theme === 'dark');
    }
  }, [budgetData]);

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

  const summary = calculateSummary(budgetData);
  const backgroundColor = theme.colors.background;

  return (
    <View style={{ padding: theme.spacing.medium, backgroundColor }}>
      <Input
        value={budgetTitle}
        placeholder="Enter budget title"
        onChangeText={setBudgetTitle}
      />
      <ScrollView>
        {Object.entries(budgetData).map(([section, items]) => {
          if (!Array.isArray(items)) return null;
          return (
            <View key={section}>
              <Text style={{ fontSize: theme.fontSizes.large }}>{section}</Text>
              {items.map((item: any) => (
                <View key={item.name}>
                  <Text>{item.name}: {formatCurrency(item.res)}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
      {summary && <Text>Total: {formatCurrency(summary.total)}</Text>}
    </View>
  );
};

export default BudgetTool;