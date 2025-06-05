import { View, Text, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, IconButton, Button, Dialog, Paragraph } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

const CalculationEditor = ({
  visible,
  onDismiss,
  section,
  item,
  setBudgetData,
  setTitle,
  title,
}) => {
  const theme = useTheme();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Variables state
  const [variables, setVariables] = useState(
    Object.entries(item)
      .filter(([k]) => !['name', 'active', 'calc'].includes(k))
      .map(([name, value], idx) => ({ name, value: String(value), id: `${name}-${idx}` }))
  );
  const [calcText, setCalcText] = useState(item.calc || '');

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
    setItemProp('calc', calcText);
    variables.forEach((v) => {
      setItemProp(v.name, v.value === '' ? 0 : Number(v.value));
    });
    onDismiss();
  };

  // Delete item with confirmation
  const deleteItem = () => {
    setDeleteDialogVisible(false);
    onDismiss();
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

  useEffect(() => {
    if (visible) {
      console.log('CalculationEditor open:', item);
    } else {
      console.log('CalculationEditor close:', item);
    }
  }, [visible, item]);

  // Styles using theme colors
  const styles = {
    modalContent: {
      backgroundColor: theme.colors.background,
      margin: 24,
      borderRadius: 8,
      padding: 20,
      elevation: 4,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.colors.text,
    },
    variableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    variableName: {
      flex: 3,
      marginRight: 8,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
    variableValue: {
      flex: 2,
      marginRight: 8,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
    variableDelete: {
      flex: 0.5,
    },
    disclaimer: {
      color: theme.colors.teal,
      backgroundColor: theme.colors.background,
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
    calcInput: {
      marginBottom: 8,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} transparent>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit '{item.name}'</Text>
            {/* Variables Table */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.text }}>Variables</Text>
            {variables.map((v, idx) => (
              <View key={idx} style={styles.variableRow}>
                <TextInput
                  label="Name"
                  value={v.name}
                  onChangeText={text => updateVariable(idx, 'name', text)}
                  style={styles.variableName}
                  dense
                  contentStyle={{ color: theme.colors.text }}
                />
                <TextInput
                  label="Value"
                  value={v.value}
                  onChangeText={text => updateVariable(idx, 'value', text)}
                  style={styles.variableValue}
                  dense
                  contentStyle={{ color: theme.colors.text }}
                  keyboardType="numeric"
                />
                <IconButton
                  icon="delete"
                  size={18}
                  onPress={() => removeVariable(idx)}
                  style={styles.variableDelete}
                />
              </View>
            ))}
            <Button icon="plus" compact onPress={addVariable}>Add Variable</Button>
            {/* Calculation Field */}
            <Text style={{ fontWeight: 'bold', marginTop: 12, color: theme.colors.text }}>Calculation</Text>
            <TextInput
              value={calcText}
              onChangeText={setCalcText}
              multiline
              mode="outlined"
              style={styles.calcInput}
              placeholder="Enter calculation expression"
              contentStyle={{ color: theme.colors.text, fontSize: 12 }}
            />
            <Text style={styles.disclaimer}>
              Use <Text style={{ fontWeight: 'bold', color: theme.colors.success }}>{'{{$var}}'}</Text> for currency variables, <Text style={{ fontWeight: 'bold', color: theme.colors.blue }}>{'{{var}}'}</Text> for calculations. Set <Text style={{ fontWeight: 'bold', color: theme.colors.error }}>res</Text> for the final value.
            </Text>
            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button onPress={onDismiss}>Cancel</Button>
              <Button mode="contained" onPress={saveModal} style={styles.deleteButton}>Save</Button>
              <Button
                mode="contained-tonal"
                onPress={() => setDeleteDialogVisible(true)}
                style={styles.deleteButton}
                color={theme.colors.red}
              >
                Delete Item
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
      {/* Delete Confirmation Dialog */}
      <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog.Title>Delete Item</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to delete this item?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
          <Button onPress={deleteItem} color={theme.colors.error}>Delete</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default CalculationEditor;
