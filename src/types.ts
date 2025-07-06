export interface Item {
  name: string;
  active: boolean;
  calc: string;
  res: number;
  // Potentially other fields if they exist or might be added
}

// budgetData is an object where keys are section names (strings)
// and values are arrays of Items.
export interface BudgetData {
  [sectionKey: string]: Item[];
}

// More specific type for BudgetContext if budgetData is always BudgetData
// For now, BudgetContext uses `any` for budgetData, so this is for reference
// or future tightening of types.
// export interface TypedBudgetContextType {
//   budgetData: BudgetData;
//   setBudgetData: React.Dispatch<React.SetStateAction<BudgetData>>;
//   themeMode?: string; // from App.tsx
//   setThemeMode?: React.Dispatch<React.SetStateAction<string>>; // from App.tsx
// }
