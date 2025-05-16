export const sumIncome = incomeArray => {
  return incomeArray.reduce((total, item) => {
    return total + (item.active ? item.res : 0);
  }, 0);
};

export const sumExpenses = expensesArray => {
  return expensesArray.reduce((total, item) => {
    return total + (item.active ? item.res : 0);
  }, 0);
};

export const calculateNetIncome = (income, expenses) => {
  return sumIncome(income) - sumExpenses(expenses);
};

export const calculateSummary = budgetData => {
  if (!budgetData) return null;

  const income = budgetData.income || [];
  const important = budgetData.important || [];
  const voluntary = budgetData.voluntary || [];

  const totalIncome = sumIncome(income);
  const totalImportant = sumExpenses(important);
  const totalVoluntary = sumExpenses(voluntary);

  return {
    totalIncome,
    totalImportant,
    totalVoluntary,
    total: calculateNetIncome(income, [...important, ...voluntary]),
  };
};
