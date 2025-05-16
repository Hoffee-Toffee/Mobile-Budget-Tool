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
  income: [],
  important: [],
  voluntary: [],
};

const useBudgetData = () => {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);

  // const loadedRef = useRef(false);

  useEffect(() => {
    // if (loadedRef.current) return;

    const loadBudgetData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('budgetData');
        if (savedData) {
          setBudgetData(JSON.parse(savedData));
        } else {
          setBudgetData(initialData);
        }
      } catch (error) {
        console.error('Failed to load budget data:', error);
        setBudgetData(initialData);
      } finally {
        loadedRef.current = true;
      }
    };

    loadBudgetData();
  }, []);

  const saveBudgetData = async (data: BudgetData) => {
    try {
      await AsyncStorage.setItem('budgetData', JSON.stringify(data));
      setBudgetData(data);
    } catch (error) {
      console.error('Failed to save budget data:', error);
    }
  };

  return {budgetData, setBudgetData};
};

export default useBudgetData;
