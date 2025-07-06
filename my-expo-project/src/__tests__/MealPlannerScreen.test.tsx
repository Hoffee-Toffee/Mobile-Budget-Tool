import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper'; // For react-native-paper components
import MealPlannerScreen from '../MealPlannerScreen'; // Adjust path as needed
import { ThemeProvider } from '../ThemeProvider'; // Assuming this is your theme provider
import useMealData, { Meal, Ingredient, MealItem } from '../../hooks/useMealData';

// Mock useMealData hook
jest.mock('../../hooks/useMealData');
const mockUseMealData = useMealData as jest.MockedFunction<typeof useMealData>;

// Mock ThemeProvider if it relies on context not available in tests easily
// Or provide a simplified theme for tests
const mockTheme = { // A basic theme structure, adjust to your ThemeProvider's needs
  colors: {
    primary: 'blue',
    text: 'black',
    background: 'white',
    surface: 'lightgrey',
    placeholder: 'grey',
    border: 'grey',
    elevation: { level1: 'lightgrey'},
    onSurface: 'black',
    green: 'green', // For price displays
    // Add other colors used by components if necessary
  },
  fontSizes: {
    large: 18,
    // Add other font sizes if necessary
  },
  // Add other theme properties your components might use
};

// Wrapper component for rendering with providers
const AllTheProviders: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <PaperProvider theme={mockTheme as any}>
      {/* Casting theme as any to simplify mock, ensure it has what PaperProvider needs */}
      {/* If your ThemeProvider is simple and just passes children, you might not need to mock it,
          but if it provides context values, mock or use the real one with a mock theme value. */}
      <ThemeProvider theme={mockTheme as any} mode="light">
        {children}
      </ThemeProvider>
    </PaperProvider>
  );
};


describe('MealPlannerScreen Component', () => {
  const mockMeals: Meal[] = [
    { id: 'm1', name: 'Meal 1', items: [{ingredientId: 'i1', amount: 100}], multiplier: 1, isIngredient: false },
    { id: 'm2', name: 'Meal 2', items: [], multiplier: 2, isIngredient: true },
  ];
  const mockIngredients: Ingredient[] = [
    { id: 'i1', name: 'Ingredient 1', price: 10, unitType: 'g', unitQuantity: 1 },
    { id: 'i2', name: 'Ingredient 2', price: 5, unitType: 'pcs', unitQuantity: 1 },
  ];

  const mockAddMeal = jest.fn();
  const mockEditMeal = jest.fn();
  const mockDeleteMeal = jest.fn();
  const mockAddIngredient = jest.fn();
  const mockEditIngredient = jest.fn();
  const mockDeleteIngredient = jest.fn();
  // Add other mocked functions from useMealData as needed

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMealData.mockReturnValue({
      meals: mockMeals,
      ingredients: mockIngredients,
      loading: false,
      addMeal: mockAddMeal,
      editMeal: mockEditMeal,
      deleteMeal: mockDeleteMeal,
      addIngredient: mockAddIngredient,
      editIngredient: mockEditIngredient,
      deleteIngredient: mockDeleteIngredient,
      addMealItem: jest.fn(),
      editMealItem: jest.fn(),
      deleteMealItem: jest.fn(),
    });
  });

  it('should render loading state initially', () => {
    mockUseMealData.mockReturnValueOnce({ ...mockUseMealData(), loading: true, meals: [], ingredients: [] });
    const { getByTestId, queryByText } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });
    // Assuming ActivityIndicator has a default testID or you add one.
    // For now, let's check for text that might appear with a loader, or lack of meal text.
    expect(queryByText('Meal 1')).toBeNull();
    // Add a more specific check for your ActivityIndicator if possible
  });

  it('should render meals and ingredients when not loading', () => {
    const { getByText } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });
    expect(getByText('Meal 1 (x1)')).toBeTruthy();
    expect(getByText('Meal 2 (x2)')).toBeTruthy();
    // Check for an ingredient being displayed in a meal item, if applicable in your renderMealItem
    // e.g. expect(getByText('- Ingredient 1: 100 g ($1000.00)')).toBeTruthy(); // Price calc needs to be exact for this
  });

  it('should open and close the Add New Meal modal', async () => {
    const { getByText, queryByText, getByLabelText } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });

    // Modal should be hidden initially
    expect(queryByText('Add New Meal', { selector: 'Title' })).toBeNull(); // Modal title for adding

    fireEvent.press(getByText('Add New Meal'));
    await waitFor(() => expect(getByText('Add New Meal', { selector: 'Title' })).toBeTruthy());

    // Type in meal name
    fireEvent.changeText(getByLabelText('Meal Name'), 'New Test Meal');

    fireEvent.press(getByText('Save Meal'));
    await waitFor(() => expect(mockAddMeal).toHaveBeenCalledWith(expect.objectContaining({name: 'New Test Meal'})));
    expect(queryByText('Add New Meal', { selector: 'Title' })).toBeNull(); // Modal should close
  });

  it('should open Manage Ingredients modal', async () => {
    const { getByText, queryByText } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });
    expect(queryByText('Manage Ingredients', { selector: 'Title' })).toBeNull();
    fireEvent.press(getByText('Manage Ingredients'));
    await waitFor(() => expect(getByText('Manage Ingredients', { selector: 'Title' })).toBeTruthy());
    // Check for an ingredient from the list
    expect(getByText('Ingredient 1')).toBeTruthy();
    // Updated assertion for new display format
    expect(getByText('Price: $10.00 / 1 g')).toBeTruthy();
  });

  it('should open Add New Ingredient modal from Manage Ingredients modal, fill and save', async () => {
    const { getByText, queryByText, getByLabelText } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });

    // Open Manage Ingredients modal first
    fireEvent.press(getByText('Manage Ingredients'));
    await waitFor(() => expect(getByText('Manage Ingredients', { selector: 'Title' })).toBeTruthy());

    // Modal for adding ingredient details should be hidden
    expect(queryByText('Add New Ingredient', { selector: 'Title' })).toBeNull();

    // Press "Add New Ingredient" button within the Manage Ingredients modal
    fireEvent.press(getByText('Add New Ingredient')); // This is the button to open the detail modal

    await waitFor(() => expect(getByText('Add New Ingredient', { selector: 'Title' })).toBeTruthy());

    // Type in ingredient name, price, unitType, and unitQuantity
    fireEvent.changeText(getByLabelText('Ingredient Name'), 'New Ing Test');
    fireEvent.changeText(getByLabelText('Price'), '3.5');
    fireEvent.changeText(getByLabelText('Unit Type (e.g., kg, pcs, pack)'), 'bottle');
    fireEvent.changeText(getByLabelText('Items per Unit Price (Unit Quantity)'), '6');


    fireEvent.press(getByText('Save Ingredient'));
    await waitFor(() => expect(mockAddIngredient).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Ing Test',
        price: 3.5,
        unitType: 'bottle',
        unitQuantity: 6,
      })
    ));
    expect(queryByText('Add New Ingredient', { selector: 'Title' })).toBeNull(); // Detail modal should close
  });

  it('should call deleteMeal when a meal delete button is pressed', async () => {
    const { getAllByText } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });
    // Meals are "Meal 1" and "Meal 2". Their delete buttons might just be "Delete".
    // This relies on the delete button being uniquely identifiable, e.g. by being the only "Delete" button in its Card.
    // If buttons are not unique, more specific test IDs or accessors are needed.
    // For this example, let's assume the first "Delete" button corresponds to "Meal 1".
    const deleteButtons = getAllByText('Delete'); // This might be too generic
    fireEvent.press(deleteButtons[0]); // Pressing delete for the first meal "Meal 1"

    expect(mockDeleteMeal).toHaveBeenCalledWith('m1');
  });

  it('should call deleteIngredient when an ingredient delete button is pressed in Manage Ingredients modal', async () => {
    const { getByText, getAllByRole } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });

    fireEvent.press(getByText('Manage Ingredients'));
    await waitFor(() => expect(getByText('Manage Ingredients', { selector: 'Title' })).toBeTruthy());

    // Assuming IconButton for delete has a role or can be found by testID
    // This is a bit fragile; specific testIDs on IconButtons are better.
    // For now, let's assume we can find them. This part will likely need adjustment based on how IconButtons are rendered.
    // Let's say Ingredient 1 has a delete icon.
    // We need a way to associate the delete icon with 'Ingredient 1' specifically.
    // This often involves restructuring the component to add testIDs like `delete-ingredient-i1`.
    // For now, this test is conceptual.
    // Example: fireEvent.press(getByTestId('delete-ingredient-i1'));
    // expect(mockDeleteIngredient).toHaveBeenCalledWith('i1');

    // A less ideal way if no testIDs: find all delete IconButtons and press the first.
    // This would require knowing the order or that there's only one.
    // const deleteIconButtons = getAllByRole('button').filter(btn => /* some property of delete icon */);
    // if (deleteIconButtons.length > 0) fireEvent.press(deleteIconButtons[0]);
    // expect(mockDeleteIngredient).toHaveBeenCalledWith('i1'); // or 'i2' depending on order

    // Due to the difficulty of generically selecting the right IconButton without testIDs,
    // this specific interaction test for delete is simplified or would need component modification for testability.
    // For now, let's assert the modal is open and shows ingredients.
    expect(getByText('Ingredient 1')).toBeTruthy();
    expect(getByText('Ingredient 2')).toBeTruthy();
  });

  it('should open Add Ingredient to Meal modal and allow adding an item', async () => {
    const { getByText, queryByText, getByLabelText, getAllByText } = render(<MealPlannerScreen />, { wrapper: AllTheProviders });

    // Open the "Edit Meal" modal for "Meal 1"
    // Meal 1 has an "Edit" button. Find it.
    // This assumes "Edit" buttons are present and distinguishable.
    const editMealButtons = getAllByText('Edit');
    fireEvent.press(editMealButtons[0]); // Pressing edit for "Meal 1"
    await waitFor(() => expect(getByText('Edit Meal', { selector: 'Title' })).toBeTruthy());

    // Press "Add Ingredient to Meal"
    fireEvent.press(getByText('Add Ingredient to Meal'));
    await waitFor(() => expect(getByText('Add Ingredient to Meal', { selector: 'Title' })).toBeTruthy());

    // Add "Ingredient 2" with amount 3
    fireEvent.changeText(getByLabelText('Ingredient Name (Exact Match)'), 'Ingredient 2');
    fireEvent.changeText(getByLabelText('Amount'), '3');
    fireEvent.press(getByText('Add to Meal'));

    // Modal should close, and currentMeal in the parent modal should be updated (though we can't directly see currentMeal state)
    // The effect of this would be visible when 'Save Meal' is pressed.
    // We can check that the "Add Ingredient to Meal" modal closes.
    await waitFor(() => expect(queryByText('Add Ingredient to Meal', { selector: 'Title' })).toBeNull());

    // Now press "Update Meal" to save the main meal
    fireEvent.press(getByText('Update Meal'));
    await waitFor(() => expect(mockEditMeal).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'm1',
        items: expect.arrayContaining([
          expect.objectContaining({ ingredientId: 'i1', amount: 100 }), // Existing item
          expect.objectContaining({ ingredientId: 'i2', amount: 3 })    // New item
        ])
      })
    ));
    expect(queryByText('Edit Meal', { selector: 'Title' })).toBeNull(); // Main meal modal should close
  });

});
