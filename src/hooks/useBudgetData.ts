import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BudgetData = {
  settings: {
    title: string;
    currency: string;
    theme: string;
    outputPeriod: string;
  };
  income: any[];
  important: any[];
  voluntary: any[];
};

export const initialData: BudgetData = {
  settings: {
    title: "Example Budget",
    currency: "en-US/USD",
    theme: "dark",
    outputPeriod: "w"
  },
  income: [
    {
      name: "Work",
      active: true,
      preset: "Wage",
      payRate: 35,
      hoursPerDay: 7.5,
      daysPerPeriod: 4,
      taxRate: 0.2005,
      inputPeriod: "w",
      primaryKey: "daysPerPeriod",
      calc: "{{$payRate}}ph * {{hoursPerDay}}h * {{daysPerPeriod}}d = {{$grossPay = payRate * hoursPerDay * daysPerPeriod}}p/p/ (gross) or ~{{$res = grossPay * (1 - taxRate)}}p/p/ (net)"
    },
    {
      name: "Benefit",
      active: false,
      preset: "Simple",
      cost: 146.87,
      quantity: 1,
      inputPeriod: "w",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    }
  ],
  important: [
    {
      name: "Rent",
      active: true,
      preset: "Simple",
      cost: 385,
      quantity: 1,
      inputPeriod: "w",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "Bus Costs",
      active: true,
      preset: "Public Transport",
      costPerTrip: 2.16,
      concessionMultiplier: 1,
      tripsPerPeriod: 8,
      inputPeriod: "w",
      primaryKey: "tripsPerPeriod",
      calc: "{{$costPerTrip = costPerTrip * concessionMultiplier}}pt * {{tripsPerPeriod}}t = {{$res = costPerTrip * tripsPerPeriod}}p/p/"
    },
    {
      name: "Car Insurance",
      active: true,
      preset: "Simple",
      cost: 21.83,
      quantity: 0.5,
      inputPeriod: "f",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "GitHub",
      active: true,
      preset: "Simple",
      cost: 177.89,
      quantity: 0.019165349048919554,
      inputPeriod: "y",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "Car Rego",
      active: true,
      preset: "Simple",
      cost: 144.22,
      quantity: 0.019165349048919554,
      inputPeriod: "y",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "Haircuts",
      active: true,
      preset: "Simple",
      cost: 35,
      quantity: 0.07666139619567822,
      inputPeriod: "y",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "Domain",
      active: true,
      preset: "Simple",
      cost: 42.5,
      quantity: 0.019165349048919554,
      inputPeriod: "y",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "Phone",
      active: true,
      preset: "Simple",
      cost: 3,
      quantity: 0.22998418858703468,
      inputPeriod: "m",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "Annual Debit Card Fee",
      active: true,
      preset: "Simple",
      cost: 10,
      quantity: 0.019165349048919554,
      inputPeriod: "y",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    }
  ],
  voluntary: [
    {
      name: "Mortgage",
      active: true,
      preset: "Simple",
      cost: 270,
      quantity: 1,
      inputPeriod: "w",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    },
    {
      name: "Savings",
      active: true,
      preset: "Simple",
      cost: 10,
      quantity: 1,
      inputPeriod: "w",
      primaryKey: "quantity",
      calc: "{{$cost}} * {{quantity}}p/p/ = {{$res = cost * quantity}}p/p/"
    }
  ]
}

const useBudgetData = () => {
  const [budgetData, initBudgetData] = useState<BudgetData | null>(null);
  const toSave = useRef(false);

  console.log(budgetData);
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

  return { budgetData, setBudgetData };
};

export default useBudgetData;
