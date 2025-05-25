import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from './ThemeProvider';
import ItemEditor from './ItemEditor';
import { capitalize, formatCurrency } from '../utils/formatters';
import { processCalculation } from '../utils/calculations';
import { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';
import { Button } from 'react-native-paper';

// Styles object
const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 4,
    marginBottom: 4,
  },
  headerItem: {
    flex: 5,
    fontWeight: 'bold',
  },
  headerActiveContainer: {
    flex: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  headerActive: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerCalculation: {
    flex: 2,
    fontWeight: 'bold',
  },
  headerOptions: {
    flex: 1,
    fontWeight: 'bold',
  },
  tableFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addItem: {
    flex: 5,
  },
  addItemButton: {
    borderRadius: 5,
  },
  addItemContent: {
    alignSelf: 'flex-start',
  },
  totalLabel: {
    flex: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabelText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalValue: {
    flex: 2,
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  totalValueText: {
    fontWeight: 'bold',
    color: 'green',
  },
  emptyOptions: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const BudgetEditor = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);

  if (!budgetData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  let sections = Object.entries(budgetData).filter(([key]) => key !== 'settings');
  const sectionTotal = (items) =>
    formatCurrency(
      items.filter(item => item.active).reduce(
        (total, item) =>
          total + (processCalculation(item).res || 0),
        0
      )
    );

  // Helper to get raw total (number) for calculations
  const sectionRawTotal = (items) =>
    items.filter(item => item.active).reduce(
      (total, item) =>
        total + (processCalculation(item).res || 0),
      0
    );

  const addItem = (section, items) => {
    const newItem = {
      name: `Item ${items.length + 1}`,
      active: true,
      calc: '',
      res: 0,
    };
    setBudgetData((prevData) => ({
      ...prevData,
      [section]: [...(prevData[section] || []), newItem],
    }));
  };

  // Find sections by name (case-insensitive)
  const getSection = (name) =>
    sections.find(([section]) => section.toLowerCase() === name.toLowerCase());

  // Get totals for Income, Important, Voluntary
  const incomeSection = getSection('income');
  const importantSection = getSection('important');
  const voluntarySection = getSection('voluntary');

  const incomeTotal = incomeSection ? sectionRawTotal(incomeSection[1]) : 0;
  const importantTotal = importantSection ? sectionRawTotal(importantSection[1]) : 0;
  const voluntaryTotal = voluntarySection ? sectionRawTotal(voluntarySection[1]) : 0;

  const leftover = incomeTotal - importantTotal;
  const finalLeftover = incomeTotal - importantTotal - voluntaryTotal;

  return (
    <ScrollView>
      {sections.map(([section, items], idx) => (
        <View key={section} style={styles.section}>
          <Text style={styles.sectionTitle}>{capitalize(section)}</Text>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerItem}>Item</Text>
            <View style={styles.headerActiveContainer}>
              <Text style={styles.headerActive}>Active</Text>
            </View>
            <Text style={styles.headerCalculation}>Calculation</Text>
            <View style={styles.headerOptions}></View>
          </View>
          {/* Table Rows */}
          {items.map((item: any) => (
            <ItemEditor key={item.name} section={section} item={item} setBudgetData={setBudgetData} />
          ))}
          {/* Table Footer */}
          <View style={styles.tableFooter}>
            {/* Add Item Button */}
            <View style={styles.addItem}>
              <Button
                icon="plus"
                mode="outlined"
                style={styles.addItemButton}
                contentStyle={styles.addItemContent}
                labelStyle={styles.addItemLabel}
                onPress={() => addItem(section, items)}
              >
                Add Item
              </Button>
            </View>
            {/* Total label right-aligned */}
            <View style={styles.totalLabel}>
              <Text style={styles.totalLabelText}>Total:</Text>
            </View>
            {/* Total value left-aligned and green */}
            <View style={styles.totalValue}>
              <Text style={styles.totalValueText}>
                {sectionTotal(items)}pw
              </Text>
            </View>
            {/* Empty options cell */}
            <View style={styles.emptyOptions} />
          </View>
          {/* After Income section, add nothing */}
          {section.toLowerCase() === 'income' && <></>}
          {/* After Important section, show (Leftover: $???) */}
          {section.toLowerCase() === 'important' && (
            <View style={{ marginTop: 4, marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold' }}>
                (Leftover: {formatCurrency(leftover)}pw)
              </Text>
            </View>
          )}
          {/* After Voluntary section, show (Final Leftover: $???) */}
          {section.toLowerCase() === 'voluntary' && (
            <View style={{ marginTop: 4, marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold' }}>
                (Final Leftover: {formatCurrency(finalLeftover)}pw)
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default BudgetEditor;