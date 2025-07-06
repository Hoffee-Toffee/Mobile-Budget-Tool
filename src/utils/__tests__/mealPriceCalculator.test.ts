import { calculateIngredientPrice, calculateMealTotalPrice } from '../mealPriceCalculator';
import { Ingredient, Meal, MealItem } from '../../hooks/useMealData'; // Adjust path as needed

describe('Meal Price Calculation Utilities', () => {
  // Updated Sample data for testing
  const sampleIngredients: Ingredient[] = [
    { id: 'ing1', name: 'Chicken', price: 10, unitType: 'kg', unitQuantity: 1 },    // $10 per 1 kg
    { id: 'ing2', name: 'Salt', price: 2, unitType: 'g', unitQuantity: 100 },       // $2 per 100 g
    { id: 'ing3', name: 'Olive Oil', price: 15, unitType: 'liter', unitQuantity: 1 }, // $15 per 1 liter
    { id: 'ing4', name: 'Water', price: 5, unitType: 'ml', unitQuantity: 1000 },    // $5 per 1000 ml (1 liter)
    { id: 'ing5', name: 'Egg', price: 3, unitType: 'pcs', unitQuantity: 12 },      // $3 per 12 pieces (a dozen)
    { id: 'ing6', name: 'Coke Can', price: 8, unitType: 'can', unitQuantity: 6 },   // $8 per 6 cans (a pack)
    { id: 'ing7', name: 'Bread Slice', price: 4, unitType: 'slice', unitQuantity: 20 },// $4 per 20 slices (a loaf)
    { id: 'ing8', name: 'Tuna Spread', price: 2, unitType: '', unitQuantity: 1 },      // $2 per 1 unit/pack
    { id: 'ing9', name: 'Gold Flakes', price: 100, unitType: 'mg', unitQuantity: 10 },// $100 per 10 mg
    { id: 'ing10', name: 'Invalid Qty Ing', price: 50, unitType: 'pcs', unitQuantity: 0 },// Invalid unitQuantity
  ];

  describe('calculateIngredientPrice', () => {
    it('should calculate price based on unitQuantity = 1', () => {
      // Chicken: $10 for 1kg. MealItem uses 0.2 kg. Cost = (10/1) * 0.2 = 2
      const mealItem: MealItem = { ingredientId: 'ing1', amount: 0.2 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(2);
    });

    it('should calculate price based on unitQuantity > 1', () => {
      // Salt: $2 for 100g. MealItem uses 50 (grams). Cost = (2/100) * 50 = 1
      const mealItem: MealItem = { ingredientId: 'ing2', amount: 50 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(1);
    });

    it('should calculate price for Eggs (pcs with unitQuantity > 1)', () => {
        // Eggs: $3 for 12 pcs. MealItem uses 2 pcs. Cost = (3/12) * 2 = 0.5
        const mealItem: MealItem = { ingredientId: 'ing5', amount: 2 };
        expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(0.5);
    });

    it('should calculate price for Coke Cans (can with unitQuantity > 1)', () => {
        // Coke: $8 for 6 cans. MealItem uses 3 cans. Cost = (8/6) * 3 = 4
        const mealItem: MealItem = { ingredientId: 'ing6', amount: 3 };
        expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(4);
    });

    it('should calculate price for Bread Slices', () => {
        // Bread: $4 for 20 slices. MealItem uses 5 slices. Cost = (4/20) * 5 = 1
        const mealItem: MealItem = { ingredientId: 'ing7', amount: 5 };
        expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(1);
    });

    it('should calculate price correctly for blank unitType (treats unitQuantity as 1 if not specified)', () => {
      // Tuna Spread: $2 for 1 pack. MealItem uses 0.5 pack. Cost = (2/1) * 0.5 = 1
      const mealItem: MealItem = { ingredientId: 'ing8', amount: 0.5 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(1);
    });

    it('should calculate price for Gold Flakes (custom unitType, specific unitQuantity)', () => {
      // Gold Flakes: $100 per 10mg. MealItem uses 5 (mg). Cost = (100/10) * 5 = 50
      const mealItem: MealItem = { ingredientId: 'ing9', amount: 5 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(50);
    });

    it('should handle ingredient with unitQuantity 0 or invalid by defaulting to 1', () => {
      // Invalid Qty Ing: $50, unitQuantity is 0 (defaults to 1). MealItem uses 2. Cost = (50/1) * 2 = 100
      const mealItem: MealItem = { ingredientId: 'ing10', amount: 2 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBeCloseTo(100);
    });

    it('should return 0 if ingredient not found', () => {
      const mealItem: MealItem = { ingredientId: 'nonexistent', amount: 1 };
      expect(calculateIngredientPrice(mealItem, sampleIngredients)).toBe(0);
    });
  });

  describe('calculateMealTotalPrice', () => {
    // Updated meal1Items based on new sampleIngredients and price logic
    // ing1 (Chicken): (10/1) * 0.1 = 1
    // ing5 (Egg): (3/12) * 2 = 0.5
    // Total for items = 1 + 0.5 = 1.5
    const meal1Items: MealItem[] = [
      { ingredientId: 'ing1', amount: 0.1 },
      { ingredientId: 'ing5', amount: 2 },
    ];
    const simpleMeal: Meal = { id: 'meal1', name: 'Simple Meal', items: meal1Items, multiplier: 1, isIngredient: false };
    // Total = 1.5 * 1 = 1.5
    const simpleMealX2: Meal = { ...simpleMeal, id: 'meal1x2', multiplier: 2 }; // Total = 1.5 * 2 = 3

    // mealIngredient (subMeal1)
    // ing1 (Chicken): (10/1) * 0.5 = 5
    const mealIngredient: Meal = { id: 'subMeal1', name: 'Chicken Dish Base', items: [{ingredientId: 'ing1', amount: 0.5}], multiplier: 1, isIngredient: true };
    // Total for subMeal1 = 5 * 1 = 5

    // complexMeal
    // SubMeal1: 2 servings, cost = 5 per serving => 2 * 5 = 10
    // ing2 (Salt): $2 per 100g. Item uses 3g. Cost = (2/100) * 3 = 0.06
    // Total for items = 10 + 0.06 = 10.06
    const complexMeal: Meal = {
      id: 'meal2',
      name: 'Complex Meal',
      items: [
        { ingredientId: 'subMeal1', amount: 2 },
        { ingredientId: 'ing2', amount: 3 },
      ],
      multiplier: 1,
      isIngredient: false,
    };
    // Total = 10.06 * 1 = 10.06

    const allMeals: Meal[] = [simpleMeal, simpleMealX2, mealIngredient, complexMeal];

    it('should calculate total price for a simple meal', () => {
      expect(calculateMealTotalPrice(simpleMeal, sampleIngredients, allMeals)).toBeCloseTo(1.5);
    });

    it('should apply multiplier correctly', () => {
      expect(calculateMealTotalPrice(simpleMealX2, sampleIngredients, allMeals)).toBeCloseTo(3);
    });

    it('should calculate total price for a meal containing another meal as an ingredient', () => {
      expect(calculateMealTotalPrice(complexMeal, sampleIngredients, allMeals)).toBeCloseTo(10.06);
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
