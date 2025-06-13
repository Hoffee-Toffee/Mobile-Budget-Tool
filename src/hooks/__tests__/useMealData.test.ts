import { act, renderHook } from '@testing-library/react-hooks';
import useMealData, { Ingredient, Meal, MealItem } from '../useMealData'; // Adjust path as needed

// Mock AsyncStorage
let mockAsyncStorageData: { [key: string]: string } = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockAsyncStorageData[key] || null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockAsyncStorageData[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockAsyncStorageData[key];
  }),
  clear: jest.fn(async () => {
    mockAsyncStorageData = {};
  }),
}));

// Mock react-native-uuid
let uuidCounter = 0;
jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => {
    uuidCounter += 1;
    return `mock-uuid-${uuidCounter}`;
  }),
}));

const MEALS_STORAGE_KEY = 'mealData';
const INGREDIENTS_STORAGE_KEY = 'ingredientData';

describe('useMealData Hook', () => {
  beforeEach(() => {
    // Clear mocks and storage before each test
    jest.clearAllMocks();
    mockAsyncStorageData = {};
    uuidCounter = 0;
  });

  it('should initialize with default data if AsyncStorage is empty', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMealData());

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate(); // Wait for useEffect to run and loading to complete

    expect(result.current.loading).toBe(false);
    expect(result.current.ingredients.length).toBeGreaterThan(0); // Expect initial ingredients
    expect(result.current.meals.length).toBeGreaterThan(0);       // Expect initial meals
    expect(require('@react-native-async-storage/async-storage').getItem).toHaveBeenCalledWith(MEALS_STORAGE_KEY);
    expect(require('@react-native-async-storage/async-storage').getItem).toHaveBeenCalledWith(INGREDIENTS_STORAGE_KEY);
  });

  it('should load data from AsyncStorage if available', async () => {
    const mockIngredients: Ingredient[] = [{ id: 'ing1', name: 'Test Ing', price: 10, unit: 'kg' }];
    const mockMeals: Meal[] = [{ id: 'meal1', name: 'Test Meal', items: [], multiplier: 1, isIngredient: false }];
    mockAsyncStorageData[INGREDIENTS_STORAGE_KEY] = JSON.stringify(mockIngredients);
    mockAsyncStorageData[MEALS_STORAGE_KEY] = JSON.stringify(mockMeals);

    const { result, waitForNextUpdate } = renderHook(() => useMealData());
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.ingredients).toEqual(mockIngredients);
    expect(result.current.meals).toEqual(mockMeals);
  });

  // More tests will be added here for CRUD operations

  describe('Ingredient CRUD Operations', () => {
    it('should add an ingredient and save to AsyncStorage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate(); // Initial load

      const newIngredientData = { name: 'Tomato', price: 2.5, unit: 'kg' };
      act(() => {
        result.current.addIngredient(newIngredientData);
      });

      expect(result.current.ingredients.length).toBe(initialIngredients.length + 1);
      const addedIngredient = result.current.ingredients.find(ing => ing.name === 'Tomato');
      expect(addedIngredient).toBeDefined();
      expect(addedIngredient?.price).toBe(2.5);
      expect(addedIngredient?.id).toBe('mock-uuid-1'); // First generated UUID

      // Wait for the useEffect that saves to AsyncStorage
      await waitForNextUpdate();
      const storedIngredients = JSON.parse(mockAsyncStorageData[INGREDIENTS_STORAGE_KEY]);
      expect(storedIngredients.find((ing: Ingredient) => ing.name === 'Tomato')).toBeDefined();
    });

    it('should edit an ingredient and save to AsyncStorage', async () => {
      // Start with initial data that includes the ingredient to be edited
      mockAsyncStorageData[INGREDIENTS_STORAGE_KEY] = JSON.stringify([{ id: 'ing-to-edit', name: 'Old Name', price: 1, unit: 'pcs' }]);
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate(); // Initial load

      const updatedIngredientData: Ingredient = { id: 'ing-to-edit', name: 'New Name', price: 1.5, unit: 'dozen' };
      act(() => {
        result.current.editIngredient(updatedIngredientData);
      });

      const editedIngredient = result.current.ingredients.find(ing => ing.id === 'ing-to-edit');
      expect(editedIngredient?.name).toBe('New Name');
      expect(editedIngredient?.price).toBe(1.5);

      await waitForNextUpdate();
      const storedIngredients = JSON.parse(mockAsyncStorageData[INGREDIENTS_STORAGE_KEY]);
      const storedEdited = storedIngredients.find((ing: Ingredient) => ing.id === 'ing-to-edit');
      expect(storedEdited?.name).toBe('New Name');
    });

    it('should delete an ingredient and save to AsyncStorage', async () => {
      const initialIng = [{ id: 'ing-to-delete', name: 'ToDelete', price: 1, unit: 'pcs' }, { id: 'ing-to-keep', name: 'ToKeep', price: 2, unit: 'kg'}];
      mockAsyncStorageData[INGREDIENTS_STORAGE_KEY] = JSON.stringify(initialIng);
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate();

      expect(result.current.ingredients.length).toBe(2);

      act(() => {
        result.current.deleteIngredient('ing-to-delete');
      });

      expect(result.current.ingredients.length).toBe(1);
      expect(result.current.ingredients.find(ing => ing.id === 'ing-to-delete')).toBeUndefined();
      expect(result.current.ingredients.find(ing => ing.id === 'ing-to-keep')).toBeDefined();

      await waitForNextUpdate();
      const storedIngredients = JSON.parse(mockAsyncStorageData[INGREDIENTS_STORAGE_KEY]);
      expect(storedIngredients.length).toBe(1);
      expect(storedIngredients.find((ing: Ingredient) => ing.id === 'ing-to-delete')).toBeUndefined();
    });
  });
});

// Helper: Get initial ingredients from the hook's module (not directly from test)
// This requires the hook module to export them or to re-declare them here for assertion counts.
// For simplicity, I'll use a known count based on the hook's internal initialData.
const initialIngredients = [
  { id: expect.any(String), name: 'Chicken Breast', price: 10, unit: 'kg' },
  { id: expect.any(String), name: 'Broccoli', price: 3, unit: 'kg' },
  { id: expect.any(String), name: 'Rice', price: 2, unit: 'kg' },
  { id: expect.any(String), name: 'Olive Oil', price: 15, unit: 'liter' },
  { id: expect.any(String), name: 'Salt', price: 1, unit: 'kg' },
  { id: expect.any(String), name: 'Pepper', price: 5, unit: 'kg' },
];
const initialMeals = [ // Based on the hook's initial data
    {
        id: expect.any(String),
        name: 'Chicken & Broccoli Stir-fry',
        items: [
            { ingredientId: expect.any(String), amount: 0.2 },
            { ingredientId: expect.any(String), amount: 0.3 },
            { ingredientId: expect.any(String), amount: 0.02 },
            { ingredientId: expect.any(String), amount: 0.002 },
            { ingredientId: expect.any(String), amount: 0.001 },
        ],
        multiplier: 1,
        isIngredient: false,
    }
];

describe('Meal CRUD Operations', () => {
    it('should add a meal and save to AsyncStorage', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate(); // Initial load

      const newMealData = { name: 'Pasta Bake', items: [], multiplier: 2, isIngredient: false };
      act(() => {
        result.current.addMeal(newMealData);
      });

      expect(result.current.meals.length).toBe(initialMeals.length + 1);
      const addedMeal = result.current.meals.find(m => m.name === 'Pasta Bake');
      expect(addedMeal).toBeDefined();
      expect(addedMeal?.multiplier).toBe(2);
      expect(addedMeal?.id).toBe('mock-uuid-1'); // Assuming ingredients didn't use UUIDs in this test run prior

      await waitForNextUpdate();
      const storedMeals = JSON.parse(mockAsyncStorageData[MEALS_STORAGE_KEY]);
      expect(storedMeals.find((m: Meal) => m.name === 'Pasta Bake')).toBeDefined();
    });

    it('should edit a meal and save to AsyncStorage', async () => {
      mockAsyncStorageData[MEALS_STORAGE_KEY] = JSON.stringify([{ id: 'meal-to-edit', name: 'Old Meal Name', items: [], multiplier: 1, isIngredient: false }]);
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate();

      const updatedMealData: Meal = { id: 'meal-to-edit', name: 'New Meal Name', items: [{ingredientId: 'ing1', amount: 100}], multiplier: 3, isIngredient: true };
      act(() => {
        result.current.editMeal(updatedMealData);
      });

      const editedMeal = result.current.meals.find(m => m.id === 'meal-to-edit');
      expect(editedMeal?.name).toBe('New Meal Name');
      expect(editedMeal?.multiplier).toBe(3);
      expect(editedMeal?.isIngredient).toBe(true);
      expect(editedMeal?.items[0]?.ingredientId).toBe('ing1');

      await waitForNextUpdate();
      const storedMeals = JSON.parse(mockAsyncStorageData[MEALS_STORAGE_KEY]);
      const storedEdited = storedMeals.find((m: Meal) => m.id === 'meal-to-edit');
      expect(storedEdited?.name).toBe('New Meal Name');
      expect(storedEdited?.isIngredient).toBe(true);
    });

    it('should delete a meal and save to AsyncStorage', async () => {
      const initialUserMeals = [{ id: 'meal-to-delete', name: 'ToDelete', items: [], multiplier: 1, isIngredient: false }, { id: 'meal-to-keep', name: 'ToKeep', items: [], multiplier: 1, isIngredient: false }];
      mockAsyncStorageData[MEALS_STORAGE_KEY] = JSON.stringify(initialUserMeals);
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate();

      expect(result.current.meals.length).toBe(2);

      act(() => {
        result.current.deleteMeal('meal-to-delete');
      });

      expect(result.current.meals.length).toBe(1);
      expect(result.current.meals.find(m => m.id === 'meal-to-delete')).toBeUndefined();
      expect(result.current.meals.find(m => m.id === 'meal-to-keep')).toBeDefined();

      await waitForNextUpdate();
      const storedMeals = JSON.parse(mockAsyncStorageData[MEALS_STORAGE_KEY]);
      expect(storedMeals.length).toBe(1);
      expect(storedMeals.find((m: Meal) => m.id === 'meal-to-delete')).toBeUndefined();
    });
  });

describe('Meal Item CRUD Operations', () => {
    const mealId = 'meal1';
    const ingId1 = 'ing1';
    const ingId2 = 'ing2';

    beforeEach(() => {
      // Setup initial meal and ingredients for meal item tests
      const initialMealForTest: Meal[] = [{ id: mealId, name: 'Test Meal For Items', items: [{ingredientId: ingId1, amount: 100}], multiplier: 1, isIngredient: false }];
      const initialIngredientsForTest: Ingredient[] = [{id: ingId1, name: 'Ing 1', price: 1, unit: 'g'}, {id: ingId2, name: 'Ing 2', price: 2, unit: 'pcs'}];
      mockAsyncStorageData[MEALS_STORAGE_KEY] = JSON.stringify(initialMealForTest);
      mockAsyncStorageData[INGREDIENTS_STORAGE_KEY] = JSON.stringify(initialIngredientsForTest); // Though not directly used by meal item ops, good to have consistent env
    });

    it('should add an item to a meal and save', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate(); // load initial data

      const newMealItem: MealItem = { ingredientId: ingId2, amount: 5 };
      act(() => {
        result.current.addMealItem(mealId, newMealItem);
      });

      const meal = result.current.meals.find(m => m.id === mealId);
      expect(meal?.items.length).toBe(2);
      expect(meal?.items.find(item => item.ingredientId === ingId2 && item.amount === 5)).toBeDefined();

      await waitForNextUpdate(); // save
      const storedMeals = JSON.parse(mockAsyncStorageData[MEALS_STORAGE_KEY]);
      const updatedMealInStorage = storedMeals.find((m: Meal) => m.id === mealId);
      expect(updatedMealInStorage?.items.length).toBe(2);
      expect(updatedMealInStorage?.items.find((item: MealItem) => item.ingredientId === ingId2)).toBeDefined();
    });

    it('should edit an item in a meal and save', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate();

      const updatedMealItem: MealItem = { ingredientId: ingId1, amount: 150 };
      act(() => {
        result.current.editMealItem(mealId, updatedMealItem);
      });

      const meal = result.current.meals.find(m => m.id === mealId);
      expect(meal?.items.find(item => item.ingredientId === ingId1)?.amount).toBe(150);

      await waitForNextUpdate();
      const storedMeals = JSON.parse(mockAsyncStorageData[MEALS_STORAGE_KEY]);
      const updatedMealInStorage = storedMeals.find((m: Meal) => m.id === mealId);
      expect(updatedMealInStorage?.items.find((item: MealItem) => item.ingredientId === ingId1)?.amount).toBe(150);
    });

    it('should delete an item from a meal and save', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMealData());
      await waitForNextUpdate();

      act(() => {
        result.current.deleteMealItem(mealId, ingId1);
      });

      const meal = result.current.meals.find(m => m.id === mealId);
      expect(meal?.items.length).toBe(0);

      await waitForNextUpdate();
      const storedMeals = JSON.parse(mockAsyncStorageData[MEALS_STORAGE_KEY]);
      const updatedMealInStorage = storedMeals.find((m: Meal) => m.id === mealId);
      expect(updatedMealInStorage?.items.length).toBe(0);
    });

    it('should also remove deleted ingredient from all meal items', async () => {
        // Setup: Meal1 contains ing1 and ing2. Meal2 contains ing1.
        const meal2Id = 'meal2';
        const initialMealsForDeleteTest: Meal[] = [
            { id: mealId, name: 'Test Meal 1', items: [{ingredientId: ingId1, amount: 100}, {ingredientId: ingId2, amount: 1}], multiplier: 1, isIngredient: false },
            { id: meal2Id, name: 'Test Meal 2', items: [{ingredientId: ingId1, amount: 50}], multiplier: 1, isIngredient: false }
        ];
        mockAsyncStorageData[MEALS_STORAGE_KEY] = JSON.stringify(initialMealsForDeleteTest);
        const { result, waitForNextUpdate } = renderHook(() => useMealData());
        await waitForNextUpdate();

        act(() => {
            result.current.deleteIngredient(ingId1); // Delete ingId1
        });

        const meal1AfterDelete = result.current.meals.find(m => m.id === mealId);
        const meal2AfterDelete = result.current.meals.find(m => m.id === meal2Id);

        expect(meal1AfterDelete?.items.length).toBe(1); // ingId2 should remain
        expect(meal1AfterDelete?.items.find(item => item.ingredientId === ingId2)).toBeDefined();
        expect(meal1AfterDelete?.items.find(item => item.ingredientId === ingId1)).toBeUndefined();

        expect(meal2AfterDelete?.items.length).toBe(0); // ingId1 was the only item

        await waitForNextUpdate(); // save ingredients
        await waitForNextUpdate(); // save meals (due to cascading update from deleteIngredient)

        const storedMeals = JSON.parse(mockAsyncStorageData[MEALS_STORAGE_KEY]);
        const storedMeal1 = storedMeals.find((m: Meal) => m.id === mealId);
        const storedMeal2 = storedMeals.find((m: Meal) => m.id === meal2Id);

        expect(storedMeal1?.items.length).toBe(1);
        expect(storedMeal2?.items.length).toBe(0);
    });
});
// Placeholder for tests to be added:
// - Saving to AsyncStorage after modification (covered within each CRUD)
// - Error handling during load (though current hook falls back to initial)
