import { formatCurrency } from '../utils/formatters';
import { processCalculation } from '../utils/calculations';
import { View, Text } from 'react-native';

const ItemEditor = ({ item, setBudgetData }) => {
  let parts = processCalculation(item).parts;
  parts = parts.map(({ type, value }, index) => <Text key={index} style={styles.value[type]}>{value}</Text>);

  return (
    <View key={item.name}>
      <Text>{item.name}: <Text>{parts}</Text></Text>
    </View>
  );
};

const styles = {
  value: {
    str: null,
    num: { color: 'blue', },
    cur: { color: 'green', },
    out: {}
  },
};

export default ItemEditor;