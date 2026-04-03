import { View, Text, ScrollView } from 'react-native';
import { periodData as rawPeriodData } from '../utils/formatters';
import { presets } from '../utils/presets';
import { Modal, Portal, TextInput, IconButton, Button, Dialog, Paragraph, Menu } from 'react-native-paper';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from './ThemeProvider';

// Type for periodData
const periodData: Record<string, { label: string; factor: number }> = rawPeriodData;


interface Variable {
  name: string;
  value: string;
  id: string;
}

type BudgetItem = {
  name: string;
  active: boolean;
  calc: string;
  primaryKey: string;
  inputPeriod: string;
  preset?: string;
  [key: string]: any;
};


interface CalculationEditorProps {
  visible: boolean;
  onDismiss: () => void;
  section: string;
  item: BudgetItem;
  setBudgetData: (data: any) => void;
  setTitle: (title: string) => void;
  title: string;
}

const CalculationEditor = ({
  visible,
  onDismiss,
  section,
  item,
  setBudgetData,
  setTitle,
  title,
}: CalculationEditorProps) => {
  // Dropdown menu state
  const [showPrimaryKeyMenu, setShowPrimaryKeyMenu] = useState(false);
  const [showInputPeriodMenu, setShowInputPeriodMenu] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(item.preset || 'Custom');
  const [menuVisible, setMenuVisible] = useState(false);
  const theme = useTheme();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
    // Output period state
  // Variables state
  const [variables, setVariables] = useState<Variable[]>(
    Object.entries(item)
      .filter(([k]) => !['name', 'active', 'calc', 'primaryKey', 'inputPeriod', 'preset'].includes(k))
      .map(([name, value], idx) => ({ name, value: String(value), id: `${name}-${idx}` }))
  );
  // Local editing state for each variable value
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  // Used to force rerender of value input when period or primaryKey changes
  const [periodVersion, setPeriodVersion] = useState(0);
  const [workingInputPeriod, setWorkingInputPeriod] = useState(item.inputPeriod);

  const setItemProp = (key: string, value: any) => {
    if (key === 'inputPeriod') {
      const preset = presets.find(p => p.name === selectedPreset);
      const primaryVarKey = selectedPreset !== 'Custom' && preset ? preset.primaryVariable : item.primaryKey;
      setWorkingInputPeriod(value);
      setVariables(vars => vars.map((v, idx) => {
        // If this variable is being edited, skip updating its value to preserve user input
        if (editingIdx !== null && idx === editingIdx) {
          return v;
        }
        if (v.name === primaryVarKey && periodData[value] && periodData[workingInputPeriod]) {
          const oldFactor = periodData[workingInputPeriod].factor;
          const newFactor = periodData[value].factor;
          const weeklyValue = Number(v.value) / oldFactor;
          const newDisplayValue = format3dp(weeklyValue * newFactor);
          console.log(`[setItemProp] Changing period: ${workingInputPeriod} -> ${value}, var: ${v.name}, oldValue: ${v.value}, newValue: ${newDisplayValue}`);
          return { ...v, value: String(newDisplayValue) };
        }
        return v;
      }));
      setPeriodVersion(v => v + 1);
    } else {
      setVariables(vars => vars.map(v => v.name === key ? { ...v, value: value } : v));
      if (key === 'primaryKey') {
        setPeriodVersion(v => v + 1);
      }
    }
  };

  // Save all modal edits

  const saveModal = () => {
    const preset = presets.find(p => p.name === selectedPreset);
    const itemToSave: BudgetItem = {
      name: title,
      active: item.active,
      calc: selectedPreset !== 'Custom' && preset ? preset.calc : (calcTextInputRef.current || ''),
      primaryKey: selectedPreset !== 'Custom' && preset ? preset.primaryVariable : item.primaryKey,
      inputPeriod: workingInputPeriod,
      preset: selectedPreset !== 'Custom' ? selectedPreset : undefined,
    };

    // Save variables from preset or custom
    if (selectedPreset !== 'Custom' && preset) {
      preset.variables.forEach((presetVar, idx) => {
        let value = variables.find(v => v.name === presetVar.key)?.value;
        if (typeof value === 'undefined' && typeof presetVar.default !== 'undefined') value = presetVar.default;
        // If this is the primary variable, convert from period value to weekly for storage
        if (presetVar.key === preset.primaryVariable && workingInputPeriod && periodData[workingInputPeriod]) {
          const factor = periodData[workingInputPeriod].factor;
          itemToSave[presetVar.key] = value === '' ? 0 : Number(value) / factor;
        } else {
          itemToSave[presetVar.key] = value === '' ? 0 : Number(value);
        }
      });
    } else {
      variables.forEach((originalVar, idx) => {
        const currentName = originalVar.name;
        let currentValueStr = originalVar.value;
        // If this is the primary variable, convert from period value to weekly for storage
        if (currentName === item.primaryKey && workingInputPeriod && periodData[workingInputPeriod]) {
          const factor = periodData[workingInputPeriod].factor;
          itemToSave[currentName] = currentValueStr === '' ? 0 : Number(currentValueStr) / factor;
        } else if (currentName) {
          itemToSave[currentName] = currentValueStr === '' ? 0 : Number(currentValueStr);
        }
      });
    }

    setBudgetData((prevData: Record<string, BudgetItem[]>) => ({
      ...prevData,
      [section]: prevData[section].map((i: BudgetItem) =>
        i.name === item.name
          ? { ...i, ...itemToSave }
          : i
      )
    }));
    onDismiss();
  };

  // Delete item with confirmation
  const deleteItem = () => {
    setDeleteDialogVisible(false);
    onDismiss();
    setBudgetData((prevData: Record<string, BudgetItem[]>) => ({
      ...prevData,
      [section]: prevData[section].filter((i: BudgetItem) => i.name !== item.name)
    }));
  };

  // Variable table handlers
  const updateVariable = (idx: number, key: string, value: string) => {
    setVariables(vars => vars.map((v, i) => i === idx ? { ...v, [key]: value } : v));
  };
  const addVariable = () => setVariables(vars => [...vars, { name: '', value: '', id: `new-${vars.length}` }]);
  const removeVariable = (idx: number) => setVariables(vars => vars.filter((_, i) => i !== idx));

  const processedItemNameRef = useRef<string | null>(null);
  const prevVisibleRef = useRef(visible);
  const primaryValueInputRef = useRef<any>(null);
  const calcTextInputRef = useRef('');

  // Effect to reset state when item changes or modal opens/closes
  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (!visible) {
      processedItemNameRef.current = null;
      return;
    }

    if (!item) {
      return;
    }

    const isNewlyVisible = !wasVisible && visible;
    const isDifferentItem = item.name !== processedItemNameRef.current;

    // Only reset workingInputPeriod and variables when modal opens or item changes
    if (isNewlyVisible || isDifferentItem) {
      setTitle(item.name);
      setWorkingInputPeriod(item.inputPeriod);
      let currentVariables: Variable[];
      if (selectedPreset !== 'Custom') {
        const preset = presets.find(p => p.name === selectedPreset);
        if (preset) {
          calcTextInputRef.current = preset.calculation;
          if (item.primaryKey !== preset.primaryVariable) setItemProp('primaryKey', preset.primaryVariable);
          currentVariables = preset.variables.map((presetVar, i) => {
            let value = item[presetVar.key];
            if (typeof value === 'undefined' && typeof presetVar.default !== 'undefined') value = presetVar.default;
            if (presetVar.key === preset.primaryVariable && workingInputPeriod && periodData[workingInputPeriod]) {
              const factor = periodData[workingInputPeriod].factor;
              value = format3dp(Number(value) * factor);
            }
            return { name: presetVar.key, value: String(value ?? ''), id: `${presetVar.key}-${i}` };
          });
        } else {
          currentVariables = [];
        }
      } else {
        calcTextInputRef.current = item.calc || '';
        currentVariables = Object.entries(item)
          .filter(([k]) => !['name', 'active', 'calc', 'primaryKey', 'inputPeriod', 'preset'].includes(k))
          .map(([name, value], i) => {
            if (name === item.primaryKey && workingInputPeriod && periodData[workingInputPeriod]) {
              const factor = periodData[workingInputPeriod].factor;
              value = format3dp(Number(value) * factor);
            }
            return { name, value: String(value), id: `${name}-${i}` };
          });
      }
      setVariables(currentVariables);

      processedItemNameRef.current = item.name;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, item, setTitle, selectedPreset]);

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
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
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
      flexDirection: 'row' as const,
      justifyContent: 'flex-end' as const,
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


  // Helper to format to 3dp for primary variable conversion only
  function format3dp(val) {
    // Show up to 3 decimal places, but no trailing zeroes
    return Number(val).toFixed(3).replace(/\.0+$|\.(\d*?[1-9])0+$/, '.$1').replace(/\.$/, '');
  }

  // Render variable rows directly to avoid memoization issues
  const preset = presets.find(p => p.name === selectedPreset);
  const currentPrimaryKey = selectedPreset !== 'Custom' && preset ? preset.primaryVariable : item.primaryKey;

  const variableRows = variables.map((v, idx) => {
    const isEditing = editingIdx === idx;
    const localValue = localEdits[v.id];
    const displayValue = isEditing && typeof localValue === 'string' ? localValue : v.value;
    return (
      <View key={v.id} style={styles.variableRow}>
        <TextInput
          label="Name"
          value={v.name}
          onChangeText={text => updateVariable(idx, 'name', text)}
          style={styles.variableName}
          dense
          contentStyle={{ color: theme.colors.text }}
          autoCorrect={false}
          autoComplete="off"
        />
        <TextInput
          key={v.id}
          label="Value"
          value={displayValue}
          onFocus={() => {
            setEditingIdx(idx);
            setLocalEdits(edits => ({ ...edits, [v.id]: v.value }));
          }}
          onBlur={() => {
            if (typeof localValue === 'string' && localValue !== v.value) {
              setVariables(vars => vars.map((vv, ii) => ii === idx ? { ...vv, value: localValue } : vv));
            }
            setEditingIdx(null);
            setLocalEdits(edits => {
              const newEdits = { ...edits };
              delete newEdits[v.id];
              return newEdits;
            });
          }}
          onChangeText={text => setLocalEdits(edits => ({ ...edits, [v.id]: text }))}
          style={styles.variableValue}
          dense
          contentStyle={{ color: theme.colors.text }}
          keyboardType="numeric"
          autoCorrect={false}
          autoComplete="off"
          ref={v.name === currentPrimaryKey ? primaryValueInputRef : undefined}
        />
        <IconButton
          icon="delete"
          size={18}
          onPress={() => removeVariable(idx)}
          style={styles.variableDelete}
        />
      </View>
    );
  });

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setSelectedPreset(item.preset || 'Custom');
            setWorkingInputPeriod(item.inputPeriod);
            setVariables(Object.entries(item)
              .filter(([k]) => !['name', 'active', 'calc', 'primaryKey', 'inputPeriod', 'preset'].includes(k))
              .map(([name, value], idx) => ({ name, value: String(value), id: `${name}-${idx}` }))
            );
            calcTextInputRef.current = item.calc || '';
            onDismiss();
          }}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              {/* Settings Heading */}
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12, color: theme.colors.text }}>Settings</Text>
              {/* Preset Dropdown */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ width: 110, color: theme.colors.text }}>Preset:</Text>
                <View style={{ flex: 1 }}>
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setMenuVisible(true)}
                        style={{ borderRadius: 5, height: 50, width: '100%', backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 }}
                        contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', height: 50 }}
                        labelStyle={{ marginLeft: 10, color: theme.colors.text, fontWeight: 'bold', flex: 1, textAlign: 'left', textTransform: 'capitalize' }}
                        icon={() => (
                          <View style={{ marginRight: -10, transform: [{ rotate: menuVisible ? '180deg' : '0deg' }] }}>
                            <IconButton icon="chevron-down" size={20} style={{ margin: 0, padding: 0 }} theme={{ colors: { primary: theme.colors.text } }} />
                          </View>
                        )}
                        textColor={theme.colors.text}
                      >
                        {selectedPreset}
                      </Button>
                    }
                    style={{ width: 150, marginTop: 0, backgroundColor: theme.colors.background }}
                    contentStyle={{ backgroundColor: theme.colors.background }}
                  >
                    {presets.map((preset) => (
                      <Menu.Item
                        key={preset.name}
                        onPress={() => {
                          setSelectedPreset(preset.name);
                          setMenuVisible(false);
                        }}
                        title={preset.name}
                        titleStyle={{ color: theme.colors.text, textTransform: 'capitalize' }}
                        style={{ backgroundColor: theme.colors.background }}
                      />
                    ))}
                    <Menu.Item
                      key="Custom"
                      onPress={() => {
                        setSelectedPreset('Custom');
                        setMenuVisible(false);
                      }}
                      title="Custom"
                      titleStyle={{ color: theme.colors.text, textTransform: 'capitalize' }}
                      style={{ backgroundColor: theme.colors.background }}
                    />
                  </Menu>
                </View>
              </View>
              {/* Input Period Dropdown */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ width: 110, color: theme.colors.text }}>Input Period:</Text>
                <View style={{ flex: 1 }}>
                  <Menu
                    visible={showInputPeriodMenu}
                    onDismiss={() => setShowInputPeriodMenu(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setShowInputPeriodMenu(true)}
                        style={{ borderRadius: 5, height: 50, width: '100%', backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 }}
                        contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', height: 50 }}
                        labelStyle={{ marginLeft: 10, color: theme.colors.text, fontWeight: 'bold', flex: 1, textAlign: 'left', textTransform: 'capitalize' }}
                        icon={() => (
                          <View style={{ marginRight: -10, transform: [{ rotate: showInputPeriodMenu ? '180deg' : '0deg' }] }}>
                            <IconButton icon="chevron-down" size={20} style={{ margin: 0, padding: 0 }} theme={{ colors: { primary: theme.colors.text } }} />
                          </View>
                        )}
                        textColor={theme.colors.text}
                      >
                        {typeof workingInputPeriod === 'string' && periodData[workingInputPeriod]?.label ? periodData[workingInputPeriod].label.charAt(0).toUpperCase() + periodData[workingInputPeriod].label.slice(1) : 'Select period'}
                      </Button>
                    }
                    style={{ width: 150, marginTop: 0, backgroundColor: theme.colors.background }}
                    contentStyle={{ backgroundColor: theme.colors.background }}
                  >
                    {Object.entries(periodData).map(([key, val]) => (
                      <Menu.Item
                        key={key}
                        onPress={() => {
                          setItemProp('inputPeriod', key);
                          setShowInputPeriodMenu(false);
                        }}
                        title={val.label.charAt(0).toUpperCase() + val.label.slice(1)}
                        titleStyle={{ color: theme.colors.text }}
                        style={{ backgroundColor: theme.colors.background }}
                      />
                    ))}
                  </Menu>
                </View>
              </View>
              {/* Primary Variable Dropdown (only show for Custom preset) */}
              {selectedPreset === 'Custom' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ width: 110, color: theme.colors.text }}>Primary Variable:</Text>
                  <View style={{ flex: 1 }}>
                    <Menu
                      visible={showPrimaryKeyMenu}
                      onDismiss={() => setShowPrimaryKeyMenu(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          onPress={() => setShowPrimaryKeyMenu(true)}
                          style={{ borderRadius: 5, height: 50, width: '100%', backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 }}
                          contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', height: 50 }}
                          labelStyle={{ marginLeft: 10, color: theme.colors.text, fontWeight: 'bold', flex: 1, textAlign: 'left' }}
                          icon={() => (
                            <View style={{ marginRight: -10, transform: [{ rotate: showPrimaryKeyMenu ? '180deg' : '0deg' }] }}>
                              <IconButton icon="chevron-down" size={20} style={{ margin: 0, padding: 0 }} />
                            </View>
                          )}
                          textColor={theme.colors.text}
                        >
                          {item.primaryKey || 'Select variable'}
                        </Button>
                      }
                      style={{ width: 150, marginTop: 45, backgroundColor: theme.colors.background }}
                      contentStyle={{ backgroundColor: theme.colors.background }}
                    >
                      {variables.map((v) => (
                        <Menu.Item
                          key={v.name}
                          onPress={() => {
                            setItemProp('primaryKey', v.name);
                            setShowPrimaryKeyMenu(false);
                          }}
                          title={v.name}
                          titleStyle={{ color: theme.colors.text }}
                          style={{ backgroundColor: theme.colors.background }}
                        />
                      ))}
                    </Menu>
                  </View>
                </View>
              )}
            {/* Variables Table */}
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12, color: theme.colors.text }}>Variables</Text>
            {selectedPreset !== 'Custom' ? (
              // Show preset variables, name not editable, value editable
              (() => {
                let presetVars = presets.find(p => p.name === selectedPreset)?.variables || [];
                if (selectedPreset === 'Simple') {
                  presetVars = presetVars.filter(v => v.key === 'cost' || v.key === 'quantity');
                }
                return presetVars.map((presetVar, idx) => (
                  <View key={presetVar.key} style={styles.variableRow}>
                    <Text
                      style={{
                        ...styles.variableName,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        borderRadius: 4,
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        opacity: 0.7,
                      }}
                    >
                      {selectedPreset === 'Simple' && presetVar.key === 'quantity' ? 'Quantity per Period' : presetVar.label}
                    </Text>
                    <TextInput
                      label="Value"
                      value={(() => {
                        const found = variables.find(v => v.name === presetVar.key);
                        if (found) return String(found.value);
                        if (typeof presetVar.default !== 'undefined') return String(presetVar.default);
                        return '';
                      })()}
                      style={styles.variableValue}
                      dense
                      editable={true}
                      contentStyle={{ color: theme.colors.text }}
                      keyboardType="numeric"
                      onChangeText={text => {
                        setVariables(vars => vars.map(v => v.name === presetVar.key ? { ...v, value: text } : v));
                      }}
                      autoCorrect={false}
                      autoComplete="off"
                    />
                  </View>
                ));
              })()
            ) : (
              <>
                {variables.map((v, idx) => {
                  // Determine the current primary variable
                  const preset = presets.find(p => p.name === selectedPreset);
                  const currentPrimaryKey = selectedPreset !== 'Custom' && preset ? preset.primaryVariable : item.primaryKey;
                  let valueInputKey = `var-value-${idx}`;
                  if (v.name === currentPrimaryKey) {
                    valueInputKey += `-${periodVersion}-${currentPrimaryKey}-${selectedPreset}`;
                  }
                  // Always use a unique key for the View as well as the TextInput for the primary variable
                  const viewKey = v.name === currentPrimaryKey ? `${idx}-${periodVersion}-${currentPrimaryKey}-${selectedPreset}` : idx;
                  // Log value for debugging
                  if (v.name === currentPrimaryKey) {
                    console.log(`[TextInput render] Primary variable '${v.name}' value:`, v.value);
                  }
                  console.log('[DEBUG] valueInputKey:', valueInputKey, 'v.value:', v.value, 'currentPrimaryKey:', currentPrimaryKey, 'idx:', idx);
                  const isPrimary = v.name === currentPrimaryKey;
                  const isEditing = editingIdx === idx;
                  const localValue = localEdits[v.id];
                  return (
                    <View key={viewKey} style={styles.variableRow}>
                      <TextInput
                        label="Name"
                        value={v.name}
                        onChangeText={text => {
                          updateVariable(idx, 'name', text);
                        }}
                        style={styles.variableName}
                        dense
                        contentStyle={{ color: theme.colors.text }}
                        autoCorrect={false}
                        autoComplete="off"
                      />
                      <TextInput
                        key={valueInputKey}
                        label="Value"
                        value={isEditing && typeof localValue === 'string' ? localValue : v.value}
                        onFocus={() => {
                          console.log(`[FOCUS] variable '${v.name}' idx=${idx} value=`, v.value);
                          setEditingIdx(idx);
                          setLocalEdits(edits => ({ ...edits, [v.id]: v.value }));
                        }}
                        onBlur={() => {
                          console.log(`[BLUR] variable '${v.name}' idx=${idx} localValue=`, localValue, 'v.value=', v.value);
                          if (typeof localValue === 'string' && localValue !== v.value) {
                            setVariables(vars => vars.map((vv, ii) => ii === idx ? { ...vv, value: localValue } : vv));
                          }
                          setEditingIdx(null);
                          setLocalEdits(edits => {
                            const newEdits = { ...edits };
                            delete newEdits[v.id];
                            return newEdits;
                          });
                        }}
                        onChangeText={text => {
                          console.log(`[CHANGE] variable '${v.name}' idx=${idx} text=`, text);
                          setLocalEdits(edits => ({ ...edits, [v.id]: text }));
                        }}
                        style={styles.variableValue}
                        dense
                        contentStyle={{ color: theme.colors.text }}
                        keyboardType="numeric"
                        autoCorrect={false}
                        autoComplete="off"
                        // Attach ref to the primary variable's value input
                        ref={v.name === currentPrimaryKey ? primaryValueInputRef : undefined}
                        // Add forceRemount prop to force remount on period change
                      />
                      <IconButton
                        icon="delete"
                        size={18}
                        onPress={() => removeVariable(idx)}
                        style={styles.variableDelete}
                      />
                    </View>
                  );
                })}
                <Button icon="plus" compact onPress={addVariable}>Add Variable</Button>
              </>
            )}
            {/* Calculation Field only for Custom preset */}
            {selectedPreset === 'Custom' && (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 12, marginBottom: 12, color: theme.colors.text }}>Calculation</Text>
                <TextInput
                  defaultValue={calcTextInputRef.current}
                  onChangeText={text => {
                    calcTextInputRef.current = text;
                  }}
                  multiline
                  mode="outlined"
                  style={styles.calcInput}
                  placeholder="Enter calculation expression"
                  contentStyle={{ color: theme.colors.text, fontSize: 12 }}
                  autoCorrect={false}
                  autoComplete="off"
                />
                <Text style={styles.disclaimer}>
                  Use <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{'{{$var}}'}</Text> for currency variables, <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{'{{var}}'}</Text> for calculations. Set <Text style={{ fontWeight: 'bold', color: theme.colors.red }}>res</Text> for the final value.
                </Text>
              </>
            )}

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
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Item</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this item?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={deleteItem} color={theme.colors.red}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default CalculationEditor;
