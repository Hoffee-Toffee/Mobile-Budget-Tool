import {formatCurrency} from './formatters';

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

export const processCalculation = data => {
  let vars = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) => !['name', 'active', 'calc'].includes(key),
    ),
  );
  const resArr = [];
  console.log(vars);

  try {
    data.calc.split(/({{.*?}})/g).forEach(part => {
      const isCalc = part.startsWith('{{') && part.endsWith('}}');
      if (!isCalc) return resArr.push({type: 'str', value: part});

      const isCurrency = part.startsWith('{{$') && part.endsWith('}}');
      part = part.slice(isCurrency ? 3 : 2, -2);

      let [calc, out] = part.split(' = ').reverse();
      Object.entries(vars).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        calc = calc.replace(regex, value);
      });

      let result = eval(calc);
      if (out !== undefined) vars[out] = result;

      if (isCurrency) {
        result = formatCurrency(result);
      }
      resArr.push({type: isCurrency ? 'cur' : 'num', value: result});
    });
  } catch (e) {
    console.error(e);
    resArr.push({type: 'str', value: '[Error: Invalid calculation]'});
  }

  return {parts: resArr, res: vars.res || 0};
};
