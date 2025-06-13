import { Meal, MealItem, Ingredient } from '../hooks/useMealData'; // Adjust if types are moved

export const calculateIngredientPrice = (
  mealItem: MealItem,
  ingredients: Ingredient[],
): number => {
  const ingredient = ingredients.find(ing => ing.id === mealItem.ingredientId);
  if (!ingredient) return 0;

  const { price, unit: ingredientBaseUnit } = ingredient;
  const { amount: itemAmount } = mealItem;

  const baseUnit = ingredientBaseUnit.toLowerCase();
  let calculatedPrice = 0;

  if (baseUnit === 'kg') {
    calculatedPrice = price * itemAmount;
  } else if (baseUnit === 'g') {
    calculatedPrice = price * itemAmount;
  } else if (baseUnit === 'liter') {
    calculatedPrice = price * itemAmount;
  } else if (baseUnit === 'ml') {
    calculatedPrice = price * itemAmount;
  } else if (['pcs', 'can', 'slice', ''].includes(baseUnit) || !baseUnit) {
    calculatedPrice = price * itemAmount;
  } else {
    console.warn(`Unhandled unit conversion for ingredient: ${ingredient.name} with unit ${baseUnit}`);
    calculatedPrice = price * itemAmount;
  }
  return calculatedPrice;
};

export const calculateMealTotalPrice = (
  meal: Meal,
  ingredients: Ingredient[],
  allMeals: Meal[], // To look up sub-meals that are ingredients
): number => {
  let total = meal.items.reduce((sum, item) => {
    const subMeal = allMeals.find(m => m.id === item.ingredientId && m.isIngredient);
    if (subMeal) {
      // Recursive call for sub-meals, ensuring 'amount' is number of servings of the sub-meal
      return sum + (calculateMealTotalPrice(subMeal, ingredients, allMeals) * item.amount);
    }
    return sum + calculateIngredientPrice(item, ingredients);
  }, 0);
  return total * meal.multiplier;
};
