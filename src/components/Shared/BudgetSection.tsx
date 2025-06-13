import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeProvider';
import BudgetSectionHeader from './BudgetSectionHeader';
import BudgetSectionFooter from './BudgetSectionFooter';
import ItemEditor from '../ItemEditor'; // Assuming ItemEditor is used to render items
import { Item } from '../../types'; // Adjusted path for Item
import { BudgetContextType } from '../../context/BudgetContext'; // Adjusted path for BudgetContextType

interface BudgetSectionProps {
  title: string;
  items: Item[];
  section: string; // Section key is a string
  onAddItem: () => void;
  totalDisplay: string;
  footerContent?: React.ReactNode;
  setBudgetData: BudgetContextType['setBudgetData'];
}

const BudgetSection: React.FC<BudgetSectionProps> = ({
  title,
  items,
  section,
  onAddItem,
  totalDisplay,
  footerContent,
  setBudgetData,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    sectionContainer: {
      marginBottom: 24,
      backgroundColor: theme.colors.background, // Ensure section bg matches theme
    },
    sectionTitle: {
      fontSize: theme.fontSizes.large,
      color: theme.colors.text,
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <BudgetSectionHeader />
      {items.map((item: Item) => (
        <ItemEditor
          key={item.name} // Consider a more stable key if names can change or repeat
          section={section as string} // Cast section to string for ItemEditor compatibility
          item={item}
          setBudgetData={setBudgetData}
        />
      ))}
      <BudgetSectionFooter onAddItem={onAddItem} totalDisplay={totalDisplay} />
      {footerContent}
    </View>
  );
};

export default BudgetSection;
