import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid'; // For generating unique IDs

// --- Data Structures ---
export interface Ingredient {
  id: string;
  name: string;
  price: number; // Price per unit
  unit: string; // e.g., "grams", "ml", "pcs", "" (for unit-less items)
}

export interface MealItem {
  ingredientId: string;
  amount: number; // Amount of the ingredient needed for one serving of the meal
}

export interface Meal {
  id: string;
  name: string;
  items: MealItem[];
  multiplier: number; // How many times this meal is planned (e.g., for batch cooking)
  isIngredient: boolean; // If true, this meal can be used as an ingredient in other meals
}

// --- AsyncStorage Keys ---
const MEALS_STORAGE_KEY = 'mealData';
const INGREDIENTS_STORAGE_KEY = 'ingredientData';

// --- Sample Data ---
const initialIngredients: Ingredient[] = [
  { id: uuid.v4() as string, name: 'Chicken Breast', price: 10, unit: 'kg' },
  { id: uuid.v4() as string, name: 'Broccoli', price: 3, unit: 'kg' },
  { id: uuid.v4() as string, name: 'Rice', price: 2, unit: 'kg' },
  { id: uuid.v4() as string, name: 'Olive Oil', price: 15, unit: 'liter' },
  { id: uuid.v4() as string, name: 'Salt', price: 1, unit: 'kg' },
  { id: uuid.v4() as string, name: 'Pepper', price: 5, unit: 'kg' },
];

const initialMeals: Meal[] = [
  {
    id: uuid.v4() as string,
    name: 'Chicken & Broccoli Stir-fry',
    items: [
      { ingredientId: initialIngredients[0].id, amount: 0.2 }, // 200g Chicken
      { ingredientId: initialIngredients[1].id, amount: 0.3 }, // 300g Broccoli
      { ingredientId: initialIngredients[3].id, amount: 0.02 }, // 20ml Olive Oil
      { ingredientId: initialIngredients[4].id, amount: 0.002 }, // 2g Salt
      { ingredientId: initialIngredients[5].id, amount: 0.001 }, // 1g Pepper
    ],
    multiplier: 1,
    isIngredient: false,
  },
];

// --- Hook Implementation ---
const useMealData = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMeals = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
        const storedIngredients = await AsyncStorage.getItem(INGREDIENTS_STORAGE_KEY);

        if (storedMeals) {
          setMeals(JSON.parse(storedMeals));
        } else {
          setMeals(initialMeals);
        }

        if (storedIngredients) {
          setIngredients(JSON.parse(storedIngredients));
        } else {
          setIngredients(initialIngredients);
        }
      } catch (error) {
        console.error("Failed to load meal data from storage", error);
        // Fallback to initial data if loading fails
        setMeals(initialMeals);
        setIngredients(initialIngredients);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save meals to AsyncStorage
  useEffect(() => {
    if (!loading) { // Avoid saving initial empty state before loading
      AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(meals))
        .catch(error => console.error("Failed to save meals", error));
    }
  }, [meals, loading]);

  // Save ingredients to AsyncStorage
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(INGREDIENTS_STORAGE_KEY, JSON.stringify(ingredients))
        .catch(error => console.error("Failed to save ingredients", error));
    }
  }, [ingredients, loading]);

  // --- Ingredients CRUD ---
  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    const newIngredient = { ...ingredient, id: uuid.v4() as string };
    setIngredients(prev => [...prev, newIngredient]);
    return newIngredient;
  };

  const editIngredient = (updatedIngredient: Ingredient) => {
    setIngredients(prev => prev.map(ing => ing.id === updatedIngredient.id ? updatedIngredient : ing));
  };

  const deleteIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
    // Optional: Also remove this ingredient from all meal items
    setMeals(prevMeals => prevMeals.map(meal => ({
      ...meal,
      items: meal.items.filter(item => item.ingredientId !== ingredientId)
    })));
  };

  // --- Meals CRUD ---
  const addMeal = (meal: Omit<Meal, 'id'>) => {
    const newMeal = { ...meal, id: uuid.v4() as string };
    setMeals(prev => [...prev, newMeal]);
    return newMeal;
  };

  const editMeal = (updatedMeal: Meal) => {
    setMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
  };

  const deleteMeal = (mealId: string) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
  };

  // --- Meal Items CRUD ---
  const addMealItem = (mealId: string, mealItem: MealItem) => {
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        // Prevent adding duplicate ingredientId; users should edit amount instead
        if (m.items.find(item => item.ingredientId === mealItem.ingredientId)) {
            return m; // Or throw an error / handle as appropriate
        }
        return { ...m, items: [...m.items, mealItem] };
      }
      return m;
    }));
  };

  const editMealItem = (mealId: string, updatedMealItem: MealItem) => {
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          items: m.items.map(item => item.ingredientId === updatedMealItem.ingredientId ? updatedMealItem : item),
        };
      }
      return m;
    }));
  };

  const deleteMealItem = (mealId: string, ingredientId: string) => {
    setMeals(prev => prev.map(m => {
      if (m.id === mealId) {
        return { ...m, items: m.items.filter(item => item.ingredientId !== ingredientId) };
      }
      return m;
    }));
  };

  return {
    meals,
    ingredients,
    loading,
    addIngredient,
    editIngredient,
    deleteIngredient,
    addMeal,
    editMeal,
    deleteMeal,
    addMealItem,
    editMealItem,
    deleteMealItem,
  };
};

export default useMealData;
