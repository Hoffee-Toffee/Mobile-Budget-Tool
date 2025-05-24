import { View } from 'react-native';
import { Text, Menu, Button, Icon } from 'react-native-paper';
import { useState } from 'react';
import Input from './Shared/Input';
import currencies from '../utils/currencies';
import { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';

const TopBar = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);

  const { settings: { title: budgetTitle, theme: budgetTheme, currency: selectedCurrency } } = budgetData;

  const openMenu = () => setCurrencyMenuVisible(true);
  const closeMenu = () => setCurrencyMenuVisible(false);

  const setBudgetTitle = (title) => {
    setBudgetData((prevData) => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        title,
      },
    }));
  }

  const setSelectedCurrency = (currency) => {
    setBudgetData((prevData) => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        currency,
      },
    }));
  };


  const styles = {
    currencyButton: {
      width: 150,
      borderRadius: 5,
    },
    currencyButtonContent: {
      justifyContent: 'space-between',
      flexDirection: 'row-reverse',
    },
    currencyButtonLabel: {
      marginLeft: 10,
    },
    currencyIcon: {
      marginRight: -10,
      transform: [{ rotate: currencyMenuVisible ? '180deg' : '0deg' }],
    },
    currencyMenu: {
      width: 150,
      marginTop: 45,
    },
    currencyMenuContent: {
      height: 520,
    },
  };

  return (
    <View>
      <Input
        value={budgetTitle}
        placeholder="Enter budget title"
        onChangeText={setBudgetTitle}
      />
      <Menu
        visible={currencyMenuVisible}
        onDismiss={closeMenu}
        anchor={
          <Button mode="outlined" onPress={openMenu} style={styles.currencyButton} contentStyle={styles.currencyButtonContent} labelStyle={styles.currencyButtonLabel} icon={() => <View style={styles.currencyIcon}><Icon source="chevron-down" size={20} /></View>}>
            {currencies.find((currency) => currency.value === selectedCurrency)?.label}
          </Button>
        }
        style={styles.currencyMenu}
        contentStyle={styles.currencyMenuContent}
      >
        {currencies.map((currency) => (
          <Menu.Item
            key={currency.value}
            onPress={() => {
              setSelectedCurrency(currency.value);
              closeMenu();
            }}
            title={currency.label}
          />
        ))}
      </Menu>
      <Text>Theme</Text>
      <Text>Import / Export</Text>
    </View>
  );
};

export default TopBar;