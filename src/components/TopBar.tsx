import { View } from 'react-native';
import { Text, Menu, Button, Icon, IconButton, TextInput } from 'react-native-paper';
import { useState } from 'react';
import currencies from '../utils/currencies';
import { useContext } from 'react';
import { BudgetContext } from '../context/BudgetContext';
import { useTheme } from './ThemeProvider';

const TopBar = () => {
  const { budgetData, setBudgetData, themeMode, setThemeMode } = useContext(BudgetContext);
  const theme = useTheme();
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
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    currencyButtonContent: {
      justifyContent: 'space-between',
      flexDirection: 'row-reverse',
      height: 50,
      alignItems: 'center',
    },
    currencyButtonLabel: {
      marginLeft: 10,
      color: theme.colors.text,
    },
    currencyIcon: {
      marginRight: -10,
      transform: [{ rotate: currencyMenuVisible ? '180deg' : '0deg' }],
    },
    currencyMenu: {
      width: 150,
      marginTop: 45,
      backgroundColor: theme.colors.background,
    },
    currencyMenuContent: {
      height: 520,
      backgroundColor: theme.colors.background,
    },
    themeToggle: {
      borderRadius: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginLeft: 0,
      height: 50,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
  };

  return (
    <View>
      <View style={styles.topRow}>
        <View style={styles.titleInput}>
          <TextInput
            mode="outlined"
            value={titleText}
            placeholder="Budget Title"
            label="Budget Title"
            onChangeText={setTitleText}
            onBlur={() => {
              saveSetting('title', titleText);
            }}
            style={{ height: 50, color: theme.colors.text, backgroundColor: theme.colors.background }}
            contentStyle={{ color: theme.colors.text, borderColor: theme.colors.border }}
            placeholderTextColor={theme.colors.text}
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
                  <Icon source="chevron-down" size={20} color={theme.colors.text} />
                </View>
              )}
              textColor={theme.colors.text}
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
              titleStyle={{ color: theme.colors.text }}
              style={{ backgroundColor: theme.colors.background }}
            />
          ))}
        </Menu>
        <IconButton
          icon={themeMode === 'dark' ? 'weather-night' : 'white-balance-sunny'}
          size={24}
          onPress={() => {
            const newTheme = themeMode === 'dark' ? 'light' : 'dark';
            setThemeMode(newTheme);
            saveSetting('theme', newTheme);
          }}
          style={styles.themeToggle}
          iconColor={theme.colors.text}
        />
      </View>
      {/* <Text>Import / Export</Text> */}
    </View>
  );
};

export default TopBar;