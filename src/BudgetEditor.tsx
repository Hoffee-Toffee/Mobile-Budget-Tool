import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper'; // Changed import
import { capitalize, formatCurrency } from './utils/formatters';
import { processCalculation } from './utils/calculations';
import { BudgetContext } from './context/BudgetContext';
import BudgetSection from './Shared/BudgetSection'; // Import the new shared component
import { Item } from './types'; // Corrected path for Item

const BudgetEditor = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);
  const theme = useTheme();

  if (!budgetData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  // Ensure settings is not treated as a section
  const sections = Object.entries(budgetData)
    .filter(([key]) => key !== 'settings')
    .map(([key, value]) => ({
      key,
      items: Array.isArray(value) ? value : [], // Ensure items is always an array
    }));


  const sectionTotal = (items: Item[]) =>
    formatCurrency(
      items.filter(item => item.active).reduce(
        (total, item) =>
          total + (processCalculation(item).res || 0),
        0
      )
    );

  const sectionRawTotal = (items: Item[]) =>
    items.filter(item => item.active).reduce(
      (total, item) =>
        total + (processCalculation(item).res || 0),
      0
    );

  const addItem = (sectionKey: string, currentItems: Item[]) => {
    const newItem: Item = {
      name: `Item ${currentItems.length + 1}`,
      active: true,
      calc: '',
      res: 0,
    };
    setBudgetData((prevData: any) => ({
      ...prevData,
      [sectionKey]: [...(prevData[sectionKey] || []), newItem],
    }));
  };

  const getSectionData = (name: string) =>
    sections.find(s => s.key.toLowerCase() === name.toLowerCase());

  const incomeSection = getSectionData('income');
  const importantSection = getSectionData('important');
  const voluntarySection = getSectionData('voluntary');

  const incomeTotal = incomeSection ? sectionRawTotal(incomeSection.items) : 0;
  const importantTotal = importantSection ? sectionRawTotal(importantSection.items) : 0;
  const voluntaryTotal = voluntarySection ? sectionRawTotal(voluntarySection.items) : 0;

  const leftover = incomeTotal - importantTotal;
  const finalLeftover = incomeTotal - importantTotal - voluntaryTotal;

  const getFooterContent = (sectionKey: string) => {
    const keyLower = sectionKey.toLowerCase();
    if (keyLower === 'important') {
      return (
        <View style={styles.footerTextContainer}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            (Leftover: <Text style={{ color: theme.colors.green }}>{formatCurrency(leftover)}</Text>pw)
          </Text>
        </View>
      );
    }
    if (keyLower === 'voluntary') {
      return (
        <View style={styles.footerTextContainer}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            (Final Leftover: <Text style={{ color: (finalLeftover <= 0 ? theme.colors.red : (finalLeftover <= 25 ? theme.colors.orange : (finalLeftover <= 50 ? theme.colors.yellow : theme.colors.green))) }}>{formatCurrency(finalLeftover)}</Text>pw)
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {sections.map(({ key: sectionKey, items }) => (
        <BudgetSection
          key={sectionKey}
          title={capitalize(sectionKey)}
          items={items as Item[]} // Cast to Item[]
          section={sectionKey as any} // Pass sectionKey as string for ItemEditor
          onAddItem={() => addItem(sectionKey, items as Item[])}
          totalDisplay={sectionTotal(items as Item[])}
          setBudgetData={setBudgetData}
          footerContent={getFooterContent(sectionKey)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerTextContainer: {
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4, // As per original styling
  },
  footerText: {
    fontWeight: 'bold',
  },
});

export default BudgetEditor;