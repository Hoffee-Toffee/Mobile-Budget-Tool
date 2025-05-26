import { processCalculation } from '../utils/calculations';
import { View, Text, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { Checkbox, IconButton, TextInput, Button, Portal, Dialog, Paragraph } from 'react-native-paper';
import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import CalculationEditor from './CalculationEditor';
import { useTheme } from './ThemeProvider';

const ItemEditor = ({ section, item, setBudgetData }) => {
  const [title, setTitle] = useState(item.name);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Variables state
  const [variables, setVariables] = useState(
    Array.isArray(item.variables)
      ? item.variables
      : (item.variables ? Object.entries(item.variables).map(([name, value]) => ({ name, value })) : [])
  );
  const [calcText, setCalcText] = useState(item.calculation || '');

  const theme = useTheme();


  const styles = {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    titleInput: {
      flex: 5,
      margin: 0,
      padding: 0,
      backgroundColor: 'transparent',
      fontSize: 16,
      height: 10,
    },
    checkboxCell: {
      flex: 1.25,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    },
    calculation: {
      flex: 2,
      display: 'flex',
    },
    options: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    value: {
      str: null,
      num: { color: theme.colors.teal },
      cur: { color: theme.colors.green },
      out: {},
    },
    // Modal styles
    modalContent: {
      backgroundColor: 'white',
      margin: 24,
      borderRadius: 8,
      padding: 20,
      elevation: 4,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    variableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    variableName: {
      flex: 2,
      marginRight: 8,
    },
    variableValue: {
      flex: 3,
      marginRight: 8,
    },
    variableDelete: {
      flex: 0.5,
    },
    disclaimer: {
      color: '#1976d2',
      backgroundColor: '#e3f2fd',
      borderRadius: 4,
      padding: 8,
      marginVertical: 8,
      fontSize: 13,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    deleteButton: {
      marginLeft: 8,
    },
  };

  const calculation = processCalculation(item);
  const res = formatCurrency(calculation.res || 0);

  const setItemProp = (key, value) => {
    setBudgetData((prevData) => ({
      ...prevData,
      [section]: [
        ...prevData[section].map((i) =>
          i.name === item.name ? { ...i, [key]: value } : i
        )
      ]
    }));
  };

  // Save all modal edits
  const saveModal = () => {
    setItemProp('name', title);
    setItemProp('variables', variables.reduce((acc, v) => ({ ...acc, [v.name]: v.value }), {}));
    setItemProp('calculation', calcText);
    setEditVisible(false);
  };

  // Delete item with confirmation
  const deleteItem = () => {
    setDeleteDialogVisible(false);
    setEditVisible(false);
    setBudgetData((prevData) => ({
      ...prevData,
      [section]: prevData[section].filter((i) => i.name !== item.name)
    }));
  };

  // Variable table handlers
  const updateVariable = (idx, key, value) => {
    setVariables(vars => vars.map((v, i) => i === idx ? { ...v, [key]: value } : v));
  };
  const addVariable = () => setVariables(vars => [...vars, { name: '', value: '' }]);
  const removeVariable = (idx) => setVariables(vars => vars.filter((_, i) => i !== idx));

  return (
    <>
      <View
        style={[
          styles.row,
          { opacity: item.active ? 1 : 0.5, backgroundColor: theme.colors.background }
        ]}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          onBlur={() => setItemProp('name', title)}
          mode="outlined"
          style={{ ...styles.titleInput, color: theme.colors.text, backgroundColor: theme.colors.background }}
          contentStyle={{ color: theme.colors.text }}
          onSubmitEditing={() => setItemProp('name', title)}
          returnKeyType="done"
        />
        {/* Active Checkbox */}
        <View style={styles.checkboxCell}>
          <Checkbox
            status={item.active ? 'checked' : 'unchecked'}
            onPress={() => setItemProp('active', !item.active)}
            color={theme.colors.primary}
            uncheckedColor={theme.colors.border}
          />
        </View>
        {/* Calculation */}
        <Text style={styles.calculation}>
          <Text style={{ color: theme.colors.green }}>{res}</Text>
          <Text style={{ color: theme.colors.text }}>pw</Text>
        </Text>
        {/* Edit */}
        <View style={styles.options}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => setEditVisible(true)}
            iconColor={theme.colors.text}
            style={{ backgroundColor: theme.colors.background }}
          />
        </View>
      </View>
      <CalculationEditor
        visible={editVisible}
        onDismiss={() => setEditVisible(false)}
        section={section}
        item={item}
        setBudgetData={setBudgetData}
        setTitle={setTitle}
        title={title}
      />
    </>
  );
};

export default ItemEditor;