import { processCalculation } from '../utils/calculations';
import { View, Text } from 'react-native';
import { Checkbox, IconButton, TextInput } from 'react-native-paper';
import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

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
    color: 'green',
  },
  options: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    str: null,
    num: { color: 'blue' },
    cur: { color: 'green' },
    out: {},
  },
};

const ItemEditor = ({ section, item, setBudgetData }) => {
  const [title, setTitle] = useState(item.name);
  const calculation = processCalculation(item);
  const parts = calculation.parts.map(
    ({ type, value }, index) => <Text key={index} style={styles.value[type]}>{value}</Text>
  );
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

  const deleteItem = (section, item) => {
    setBudgetData((prevData) => ({
      ...prevData,
      [section]: prevData[section].filter((i) => i.name !== item.name)
    }));
  };

  return (
    <View
      style={[
        styles.row,
        { opacity: item.active ? 1 : 0.5 }
      ]}
    >
      <TextInput
        value={title}
        onChangeText={setTitle}
        onBlur={() => setItemProp('name', title)}
        mode="outlined"
        style={styles.titleInput}
        theme={{ colors: { background: 'transparent' } }}
        onSubmitEditing={() => setItemProp('name', title)}
        returnKeyType="done"
      />
      {/* Active Checkbox */}
      <View style={styles.checkboxCell}>
        <Checkbox
          status={item.active ? 'checked' : 'unchecked'}
          onPress={() => setItemProp('active', !item.active)}
        />
      </View>
      {/* Calculation */}
      <Text style={styles.calculation}>{res}</Text>
      {/* Edit (Deletes for now) */}
      <View style={styles.options}>
        <IconButton icon="pencil" size={20} onPress={() => deleteItem(section, item)} />
      </View>
    </View>
  );
};

export default ItemEditor;