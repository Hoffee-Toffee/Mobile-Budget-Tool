// Get 'currency' from the context provider
import {useContext} from 'react';
import {BudgetContext} from '../context/BudgetContext';

export const formatCurrency = (value: number): string => {
  const {budgetData} = useContext(BudgetContext);
  const currency = budgetData?.settings?.currency;

  if (!currency) {
    return value.toString();
  }
  const [locale, currencyCode] = currency.split('/');

  // Determine fraction digits: 0 if no significant decimals, 2 if there are
  let minimumFractionDigits = 0;

  const abs = Math.abs(value);
  if (abs !== Math.floor(abs)) {
    const twoDigits = Math.round((abs % 1) * 100);
    if (twoDigits) minimumFractionDigits = 2;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
