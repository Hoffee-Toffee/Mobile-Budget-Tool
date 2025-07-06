import { processCalculation } from '../utils/calculations';
import { View, Text } from 'react-native';
import { Checkbox, IconButton, TextInput, useTheme } from 'react-native-paper'; // Changed import
import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import CalculationEditor from './CalculationEditor';

const ItemEditor = ({ section, item, setBudgetData }) => {
  const [title, setTitle] = useState(item.name);
  const [editVisible, setEditVisible] = useState(false);

  const theme = useTheme(); // Now from react-native-paper

  const styles = {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    dragHandle: {
      margin: 0,
      width: 35,
    },
    titleGroup: {
      flex: 5,
      flexDirection: 'row',
      margin: 0,
      padding: 0,
      alignItems: 'center',
    },
    titleInput: {
      height: 10,
      flex: 5,
      padding: 0,
      margin: 0,
      backgroundColor: 'transparent',
      fontSize: 16,
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

  return (
    <>
      <View
        style={[
          styles.row,
          { opacity: item.active ? 1 : 0.5, backgroundColor: theme.colors.background }
        ]}
      >
        {/* Drag Handle */}
        {/* Title */}
        <View style={styles.titleGroup}>
          <IconButton
            icon="drag-horizontal-variant"
            size={20}
            iconColor={theme.colors.text}
            style={styles.dragHandle}
          />
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

        </View>
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