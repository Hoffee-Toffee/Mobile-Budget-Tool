import { Meal, MealItem, Ingredient } from '../hooks/useMealData'; // Adjust if types are moved

export const calculateIngredientPrice = (
  mealItem: MealItem,
  ingredients: Ingredient[],
): number => {
  const ingredient = ingredients.find(ing => ing.id === mealItem.ingredientId);
  if (!ingredient) return 0;

  // The price is for a certain quantity of a certain unit type.
  // e.g., $10 for 1 kg of chicken. (price: 10, unitQuantity: 1, unitType: 'kg')
  // e.g., $3 for 500 g of flour. (price: 3, unitQuantity: 500, unitType: 'g')
  // e.g., $2 for 1 pack of gum. (price: 2, unitQuantity: 1, unitType: 'pack')

  const { price, unitQuantity } = ingredient;
  const { amount: mealItemAmount } = mealItem;

  // Ensure unitQuantity is a positive number to avoid division by zero or negative quantities.
  // The hook and UI should enforce this, but this is a safeguard.
  const safeUnitQuantity = (unitQuantity && unitQuantity > 0) ? unitQuantity : 1;

  // Calculate the price per single base unit of the ingredient.
  // For example, if price is $10 for 1kg, pricePerBaseUnit is $10.
  // If price is $3 for 500g, pricePerBaseUnit for 1g is $3/500.
  // However, the mealItem.amount is assumed to be in the *effective priced unit*.
  // e.g. if chicken is $10 for 1kg, and meal uses 0.2 (meaning 0.2 kg), then cost is (10/1)*0.2 = 2
  // e.g. if flour is $3 for 500g pack, and meal uses 0.5 (meaning 0.5 of a 500g pack), then cost is (3/1)*0.5 = 1.5.
  // The `unitType` (kg, g, pcs) is for user information and data entry consistency.
  // The `mealItem.amount` is the quantity of these "effective priced units".

  // The formula (ingredient.price / (ingredient.unitQuantity || 1)) * mealItem.amount
  // correctly calculates the cost if mealItem.amount refers to how many of these "ingredient definition units" are used.
  // For example:
  // Ingredient: Price: $10, UnitType: 'kg', UnitQuantity: 1. (Price is $10 per 1 kg)
  // MealItem: Amount: 0.2 (meaning 0.2 of the "1 kg" unit) -> Cost = (10 / 1) * 0.2 = $2.
  // Ingredient: Price: $5, UnitType: 'pack', UnitQuantity: 6. (Price is $5 per 6-pack)
  // MealItem: Amount: 0.5 (meaning 0.5 of a "6-pack" unit) -> Cost = (5 / 6) * 0.5 = $0.4166 * 0.5 = $0.2083 (approx for half of one item from the pack)
  // This interpretation of `mealItem.amount` as a multiplier for the defined ingredient package/quantity seems to be what's implied by the current system.
  // The price calculation should be: (price of the defined unitQuantity) / unitQuantity * mealItem.amount (if mealItem.amount is in base units like 1g, 1ml)
  // OR price * (mealItem.amount / unitQuantity) (if mealItem.amount is in base units)

  // Given the existing structure and how amounts were previously handled (e.g. 0.2 for 200g when price is per 1kg),
  // `mealItem.amount` is a multiplier of the base unit defined by `unitType` when `unitQuantity` is 1.
  // If `unitQuantity` is > 1 (e.g. price for a 500g pack), then `mealItem.amount` should represent
  // how many of these packs (or portions of it) are used.
  // Example: Ingredient: $3 for a 500g pack (price:3, unitType:'g', unitQuantity:500 - this is wrong. It should be unitType:'pack', unitQuantity:1 if price is per pack OR price: X, unitType:'g', unitQuantity:500 if price is for 500g)
  // Let's assume: Price is $X for Y Zs (e.g. $10 for 1 kg, $3 for 6 cans)
  // mealItem.amount is the quantity of Zs used (e.g. 0.2 kg, 2 cans)
  // Price per Z = ingredient.price / ingredient.unitQuantity
  // Cost = (ingredient.price / safeUnitQuantity) * mealItemAmount

  const calculatedPrice = (price / safeUnitQuantity) * mealItemAmount;

  // The previous logic distinguishing 'kg', 'g', etc. was more about how to interpret mealItemAmount
  // if it wasn't already normalized to the ingredient's pricing unit.
  // Since mealItem.amount is now consistently "amount of the effective priced unit",
  // the specific unitType (kg, g, pcs) does not change the formula directly,
  // but it's crucial for the user to understand what 1 unit of `mealItem.amount` means.
  // For example, if ingredient is "Eggs", price 3, unitType "pcs", unitQuantity 12 (a dozen eggs for $3),
  // and mealItem.amount is 2 (meaning 2 eggs), then price is (3/12) * 2 = $0.50.

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
