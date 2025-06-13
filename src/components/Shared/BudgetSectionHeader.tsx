import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeProvider';

const BudgetSectionHeader: React.FC = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      paddingBottom: 4,
      marginBottom: 4,
    },
    headerItem: {
      flex: 5,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerActiveContainer: {
      flex: 1.25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerActive: {
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.colors.text,
    },
    headerCalculation: {
      flex: 2,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerOptions: {
      flex: 1, // For spacing, matches ItemEditor's options
    },
  });

  return (
    <View style={styles.tableHeader}>
      <Text style={styles.headerItem}>Item</Text>
      <View style={styles.headerActiveContainer}>
        <Text style={styles.headerActive}>Active</Text>
      </View>
      <Text style={styles.headerCalculation}>Calculation</Text>
      <View style={styles.headerOptions} />
    </View>
  );
};

export default BudgetSectionHeader;
