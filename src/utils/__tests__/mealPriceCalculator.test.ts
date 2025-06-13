import { calculateIngredientPrice, calculateMealTotalPrice } from '../mealPriceCalculator';
import { Ingredient, Meal, MealItem } from '../../hooks/useMealData'; // Adjust path as needed

describe('Meal Price Calculation Utilities', () => {
  // Sample data for testing
  const sampleIngredients: Ingredient[] = [
    { id: 'ing1', name: 'Chicken', price: 10, unit: 'kg' }, // 10 per kg
    { id: 'ing2', name: 'Salt', price: 1, unit: 'g' },     // 1 per g
    { id: 'ing3', name: 'Olive Oil', price: 15, unit: 'liter' },// 15 per liter
    { id: 'ing4', name: 'Water', price: 0.1, unit: 'ml' },  // 0.1 per ml
    { id: 'ing5', name: 'Egg', price: 0.5, unit: 'pcs' },   // 0.5 per piece
    { id: 'ing6', name: 'Coke Can', price: 1.5, unit: 'can' }, // 1.5 per can
    { id: 'ing7', name: 'Bread Slice', price: 0.2, unit: 'slice' }, // 0.2 per slice
    { id: 'ing8', name: 'Tuna Spread', price: 2, unit: '' }, // 2 per "unit" (e.g. a pack)
    { id: 'ing9', name: 'Gold Flakes', price: 100, unit: 'mg' }, // Example of a unit not explicitly handled by simple cases
  ];

  describe('calculateIngredientPrice', () => {
    it('should calculate price correctly for unit "kg"', () => {
      // Using 0.2 kg of Chicken (10/kg) = 2
      const mealItem: MealItem = { ingredientId: 'ing1', amount: 0.2 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(10 * 0.2);
    });

    it('should calculate price correctly for unit "g"', () => {
      // Using 5g of Salt (1/g) = 5
      const mealItem: MealItem = { ingredientId: 'ing2', amount: 5 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(1 * 5);
    });

    it('should calculate price correctly for unit "liter"', () => {
      // Using 0.05 liter of Olive Oil (15/liter) = 0.75
      const mealItem: MealItem = { ingredientId: 'ing3', amount: 0.05 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(15 * 0.05);
    });

    it('should calculate price correctly for unit "ml"', () => {
      // Using 100ml of Water (0.1/ml) = 10
      const mealItem: MealItem = { ingredientId: 'ing4', amount: 100 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(0.1 * 100);
    });

    it('should calculate price correctly for unit "pcs"', () => {
      // Using 2 Eggs (0.5/pcs) = 1
      const mealItem: MealItem = { ingredientId: 'ing5', amount: 2 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(0.5 * 2);
    });

    it('should calculate price correctly for unit "can"', () => {
      const mealItem: MealItem = { ingredientId: 'ing6', amount: 3 }; // 3 cans
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(1.5 * 3);
    });

    it('should calculate price correctly for unit "slice"', () => {
      const mealItem: MealItem = { ingredientId: 'ing7', amount: 4 }; // 4 slices
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(0.2 * 4);
    });

    it('should calculate price correctly for blank unit (treat as per item/pack)', () => {
      // Using 0.5 pack of Tuna Spread (2/pack) = 1
      const mealItem: MealItem = { ingredientId: 'ing8', amount: 0.5 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(2 * 0.5);
    });

    it('should calculate price with default multiplication for unhandled specific units like "mg"', () => {
      // Using 10mg of Gold Flakes (100/mg) = 1000
      const mealItem: MealItem = { ingredientId: 'ing9', amount: 10 };
      // Expect console.warn to have been called if possible to spy on it
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(100 * 10);
    });

    it('should return 0 if ingredient not found', () => {
      const mealItem: MealItem = { ingredientId: 'nonexistent', amount: 1 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(0);
    });
  });

  describe('calculateMealTotalPrice', () => {
    const meal1Items: MealItem[] = [
      { ingredientId: 'ing1', amount: 0.1 }, // Chicken 0.1kg = 1
      { ingredientId: 'ing5', amount: 2 },   // Egg 2pcs = 1
    ]; // Total for items = 1 + 1 = 2
    const simpleMeal: Meal = { id: 'meal1', name: 'Simple Meal', items: meal1Items, multiplier: 1, isIngredient: false };
    const simpleMealX2: Meal = { ...simpleMeal, id: 'meal1x2', multiplier: 2 }; // Total = 2 * 2 = 4

    const mealIngredient: Meal = { id: 'subMeal1', name: 'Chicken Dish Base', items: [{ingredientId: 'ing1', amount: 0.5}], multiplier: 1, isIngredient: true }; // 0.5kg Chicken = 5

    const complexMeal: Meal = {
      id: 'meal2',
      name: 'Complex Meal',
      items: [
        { ingredientId: 'subMeal1', amount: 2 }, // 2 servings of Chicken Dish Base = 2 * 5 = 10
        { ingredientId: 'ing2', amount: 3 },     // 3g Salt = 3 * 1 = 3
      ],
      multiplier: 1,
      isIngredient: false,
    }; // Total = 10 + 3 = 13

    const allMeals: Meal[] = [simpleMeal, simpleMealX2, mealIngredient, complexMeal];

    it('should calculate total price for a simple meal', () => {
      expect(calculateMealTotalPrice(simpleMeal, sampleIngredients, allMeals)).toBe(2);
    });

    it('should apply multiplier correctly', () => {
      expect(calculateMealTotalPrice(simpleMealX2, sampleIngredients, allMeals)).toBe(4);
    });

    it('should calculate total price for a meal containing another meal as an ingredient', () => {
      expect(calculateMealTotalPrice(complexMeal, sampleIngredients, allMeals)).toBe(13);
    });

    it('should handle meal as ingredient with its own multiplier (sub-meal multiplier is part of its pre-calculated cost)', () => {
        const mealWithMultipliedSubMeal: Meal = {
            id: 'meal3',
            name: 'Meal with Multiplied Sub-Meal',
            items: [
                // mealIngredient's own items total 5. If mealIngredient had multiplier 2, its cost would be 10.
                // Here, we use 1 serving of mealIngredient (amount: 1)
                { ingredientId: 'subMeal1', amount: 1 }
            ],
            multiplier: 1,
            isIngredient: false,
        };
         // subMeal1 (Chicken Dish Base) has items costing 5, multiplier 1. So its cost is 5.
        expect(calculateMealTotalPrice(mealWithMultipliedSubMeal, sampleIngredients, [simpleMeal, simpleMealX2, mealIngredient, complexMeal, mealWithMultipliedSubMeal])).toBe(5);

        const mealIngredientX3: Meal = { ...mealIngredient, id: 'subMeal1x3', multiplier: 3, isIngredient: true }; // Cost = 5 * 3 = 15
        const mealWithSubMealX3: Meal = {
            ...mealWithMultipliedSubMeal,
            id: 'meal4',
            items: [{ingredientId: 'subMeal1x3', amount: 1}]
        };
        // Cost of 1 serving of mealIngredientX3 = 15
        expect(calculateMealTotalPrice(mealWithSubMealX3, sampleIngredients, [simpleMeal, simpleMealX2, mealIngredientX3, complexMeal, mealWithSubMealX3])).toBe(15);
    });

    it('should return 0 if meal has no items', () => {
      const emptyMeal: Meal = { id: 'empty', name: 'Empty Meal', items: [], multiplier: 1, isIngredient: false };
      expect(calculateMealTotalPrice(emptyMeal, sampleIngredients, allMeals)).toBe(0);
    });
  });
});
