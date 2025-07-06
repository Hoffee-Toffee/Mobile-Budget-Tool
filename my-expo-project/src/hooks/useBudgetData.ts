import {useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BudgetData = {
  settings: {
    title: string;
    currency: string;
    theme: string;
  };
  income: any[];
  important: any[];
  voluntary: any[];
};

const initialData: BudgetData = {
  settings: {
    title: 'Example Budget',
    currency: 'en-US/USD',
    theme: 'light',
  },
  income: [
    {
      name: 'Work',
      calc: '{{$payRate}}ph * {{hoursPerDay}}h * {{daysPerWeek}}d = {{$grossPay = payRate * hoursPerDay * daysPerWeek}}pw (gross) or ~{{$res = grossPay * netMult + netAdd}}pw (net)',
      active: true,
      payRate: 25,
      hoursPerDay: 8.5,
      daysPerWeek: 4,
      netMult: 0.777,
      netAdd: 21,
    },
    {
      name: 'Benefit',
      active: false,
      res: 146.87,
      calc: '{{$res}}pw',
    },
  ],
  important: [
    {
      calc: '{{$res}}pw',
      active: true,
      res: 320,
      name: 'Rent',
    },
    {
      calc: '{{$tripCost = tripCost * concessionMult}}pt * {{tripsPerDay}}t * {{daysPerWeek}}d = {{$res = tripCost * tripsPerDay * daysPerWeek}}pw (overestimate)',
      active: true,
      tripCost: 2.1,
      concessionMult: 0.5,
      tripsPerDay: 2,
      daysPerWeek: 2,
      name: 'Bus Costs',
    },
    {
      name: 'Phone',
      calc: '~{{$monthlyCost}}pm * 12m / 52w = {{$weeklyCost = (monthlyCost * 12) / 52}}pw ~= {{$res = Math.ceil(weeklyCost / roundConst) * roundConst}}pw (rounded up just in case)',
      active: true,
      monthlyCost: 3,
      roundConst: 0.5,
    },
    {
      name: 'Annual Debit Card Fee',
      calc: '{{$yearlyCost}}py / 52w = {{$res = yearlyCost / 52}}pw (overestimate)',
      active: true,
      yearlyCost: 10,
    },
  ],
  voluntary: [
    {
      name: 'Savings',
      calc: '{{$res}}pw',
      active: true,
      res: 50,
    },
    {
      name: 'Pay Debt',
      calc: '{{$res}}pw',
      active: true,
      res: 100,
    },
  ],
};

const useBudgetData = () => {
  const [budgetData, initBudgetData] = useState<BudgetData | null>(null);
  const toSave = useRef(false);

  const setBudgetData = (data: BudgetData) => {
    toSave.current = true;
    initBudgetData(data);
  };

  useEffect(() => {
    const loadBudgetData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('budgetData');
        if (savedData) {
          initBudgetData(JSON.parse(savedData));
        } else {
          initBudgetData(initialData);
        }
      } catch (error) {
        console.error('Failed to load budget data:', error);
        setBudgetData(initialData);
      }
    };

    loadBudgetData();
  }, []);

  useEffect(() => {
    if (budgetData && toSave.current) {
      toSave.current = false;
      saveBudgetData(budgetData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetData]);

  const saveBudgetData = async (data: BudgetData) => {
    try {
      await AsyncStorage.setItem('budgetData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save budget data:', error);
    }
  };

  return {budgetData, setBudgetData};
};

export default useBudgetData;
