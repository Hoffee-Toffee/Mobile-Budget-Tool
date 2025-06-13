import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '../ThemeProvider';

interface BudgetSectionFooterProps {
  onAddItem: () => void;
  totalDisplay: string;
}

const BudgetSectionFooter: React.FC<BudgetSectionFooterProps> = ({
  onAddItem,
  totalDisplay,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    tableFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    addItemContainer: {
      flex: 5,
    },
    addItemButton: {
      borderRadius: 5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    addItemContent: {
      alignSelf: 'flex-start', // Aligns button content to the left
    },
    addItemLabel: {
      color: theme.colors.text,
      paddingLeft: 15, // Keep the original padding for the text inside button
    },
    totalLabelContainer: {
      flex: 1.25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    totalLabelText: {
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.colors.text,
    },
    totalValueContainer: {
      flex: 2,
      alignItems: 'flex-start', // Align text to the left
    },
    totalValueText: {
      fontWeight: 'bold',
      color: theme.colors.green,
    },
    currencyText: {
      color: theme.colors.text,
    },
    emptyOptionsCell: {
      flex: 1, // For spacing, matches ItemEditor's options
    },
  });

  return (
    <View style={styles.tableFooter}>
      <View style={styles.addItemContainer}>
        <Button
          icon="plus"
          compact
          mode="outlined"
          style={styles.addItemButton}
          contentStyle={styles.addItemContent}
          labelStyle={styles.addItemLabel}
          onPress={onAddItem}
        >
          Add Item
        </Button>
      </View>
      <View style={styles.totalLabelContainer}>
        <Text style={styles.totalLabelText}>Total:</Text>
      </View>
      <View style={styles.totalValueContainer}>
        <Text>
          <Text style={styles.totalValueText}>{totalDisplay}</Text>
          <Text style={styles.currencyText}>pw</Text>
        </Text>
      </View>
      <View style={styles.emptyOptionsCell} />
    </View>
  );
};

export default BudgetSectionFooter;
