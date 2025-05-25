import { View, Text, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, IconButton, Button, Dialog, Paragraph } from 'react-native-paper';
import { useState, useEffect } from 'react';

const styles = {
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
    flex: 3,
    marginRight: 8,
  },
  variableValue: {
    flex: 2,
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

const CalculationEditor = ({
  visible,
  onDismiss,
  section,
  item,
  setBudgetData,
  setTitle,
  title,
}) => {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Variables state
  const [variables, setVariables] = useState(
    Object.entries(item)
      .filter(([k]) => !['name', 'active', 'calc'].includes(k))
      .map(([name, value]) => ({ name, value: String(value) }))
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

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} transparent>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit '{item.name}'</Text>
            {/* Variables Table */}
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Variables</Text>
            {variables.map((v, idx) => (
              <View key={idx} style={styles.variableRow}>
                <TextInput
                  label="Name"
                  value={v.name}
                  onChangeText={text => updateVariable(idx, 'name', text)}
                  style={styles.variableName}
                  dense
                />
                <TextInput
                  label="Value"
                  value={v.value}
                  onChangeText={text => updateVariable(idx, 'value', text)}
                  style={styles.variableValue}
                  dense
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
            <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Calculation</Text>
            <TextInput
              value={calcText}
              onChangeText={setCalcText}
              multiline
              mode="outlined"
              style={{ marginBottom: 8 }}
              placeholder="Enter calculation expression"
            />
            <Text style={styles.disclaimer}>
              Use <Text style={{ fontWeight: 'bold', color: '#388e3c' }}>{'{{$var}}'}</Text> for currency variables, <Text style={{ fontWeight: 'bold', color: '#1976d2' }}>{'{{var}}'}</Text> for calculations. Set <Text style={{ fontWeight: 'bold', color: '#d32f2f' }}>res</Text> for the final value.
            </Text>
            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button onPress={onDismiss}>Cancel</Button>
              <Button mode="contained" onPress={saveModal} style={styles.deleteButton}>Save</Button>
              <Button
                mode="contained-tonal"
                onPress={() => setDeleteDialogVisible(true)}
                style={styles.deleteButton}
                color="#d32f2f"
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
          <Button onPress={deleteItem} color="#d32f2f">Delete</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default CalculationEditor;
