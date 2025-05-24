import { View } from 'react-native';
import { Text, Menu, Button, Icon, IconButton } from 'react-native-paper';
import { useState } from 'react';
import Input from './Shared/Input';
import currencies from '../utils/currencies';
import { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';

const TopBar = () => {
  const { budgetData, setBudgetData } = useContext(BudgetContext);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);

  const { settings: { title: budgetTitle, theme: budgetTheme, currency: selectedCurrency } } = budgetData;
  const [titleText, setTitleText] = useState(budgetTitle);

  const openMenu = () => setCurrencyMenuVisible(true);
  const closeMenu = () => setCurrencyMenuVisible(false);

  const saveSetting = (key, value) => {
    setBudgetData((prevData) => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        [key]: value,
      },
    }));
  };

  const styles = {
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    titleInput: {
      top: -2.5,
      flex: 1,
      height: 50,
      justifyContent: 'center',
    },
    currencyButton: {
      width: 150,
      borderRadius: 5,
      height: 50,
      justifyContent: 'center',
    },
    currencyButtonContent: {
      justifyContent: 'space-between',
      flexDirection: 'row-reverse',
      height: 50,
      alignItems: 'center',
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
    themeToggle: {
      borderRadius: 5,
      borderWidth: 1,
      borderColor: 'gray',
      marginLeft: 0,
      height: 50,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
  };

  return (
    <View>
      <View style={styles.topRow}>
        <View style={styles.titleInput}>
          <Input
            value={titleText}
            placeholder="Enter budget title"
            onChangeText={setTitleText}
            onBlur={() => {
              saveSetting('title', titleText);
            }}
            style={{ height: 50 }}
            inputStyle={{ height: 50 }}
          />
        </View>
        <Menu
          visible={currencyMenuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button
              mode="outlined"
              onPress={openMenu}
              style={styles.currencyButton}
              contentStyle={styles.currencyButtonContent}
              labelStyle={styles.currencyButtonLabel}
              icon={() => (
                <View style={styles.currencyIcon}>
                  <Icon source="chevron-down" size={20} />
                </View>
              )}
            >
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
                saveSetting('currency', currency.value);
                closeMenu();
              }}
              title={currency.label}
            />
          ))}
        </Menu>
        <IconButton
          icon={budgetTheme === 'dark' ? 'weather-night' : 'white-balance-sunny'}
          size={24}
          onPress={() => {
            saveSetting('theme', budgetTheme === 'dark' ? 'light' : 'dark');
          }}
          style={styles.themeToggle}
        />
      </View>
      {/* <Text>Import / Export</Text> */}
    </View>
  );
};

export default TopBar;