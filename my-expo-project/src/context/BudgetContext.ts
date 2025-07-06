import React, {createContext} from 'react';

export type BudgetContextType = {
  budgetData: any;
  setBudgetData: React.Dispatch<React.SetStateAction<any>>;
};

export const BudgetContext = createContext<BudgetContextType | undefined>(
  undefined,
);
