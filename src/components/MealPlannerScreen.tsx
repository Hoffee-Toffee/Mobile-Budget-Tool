import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Button, Modal, Portal, Provider as PaperProvider, ActivityIndicator, Card, Title, Paragraph, TextInput, Checkbox } from 'react-native-paper';
import useMealData, { Meal, Ingredient, MealItem } from '../hooks/useMealData';
import { useTheme } from './ThemeProvider'; // Assuming you have a ThemeProvider
import ScreenWrapper from './ScreenWrapper'; // Import the actual ScreenWrapper
import { calculateIngredientPrice, calculateMealTotalPrice } from '../utils/mealPriceCalculator'; // Import new calc functions

const MealPlannerScreen: React.FC = () => {
  const {
    meals,
    ingredients,
    loading,
    addMeal,
    editMeal,
    deleteMeal,
    addIngredient,
    editIngredient,
    deleteIngredient,
    addMealItem,
    editMealItem,
    deleteMealItem,
  } = useMealData();

  const theme = useTheme();
  const [mealModalVisible, setMealModalVisible] = useState(false);

  // States for Add/Edit Meal Modal
  const [currentMeal, setCurrentMeal] = useState<Partial<Meal> & { id?: string }>({});
  const [isEditingMeal, setIsEditingMeal] = useState(false);

  // States for Ingredient Modals
  const [manageIngredientsModalVisible, setManageIngredientsModalVisible] = useState(false);
  const [ingredientDetailModalVisible, setIngredientDetailModalVisible] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<Partial<Ingredient> & { id?: string }>({});
  const [isEditingIngredient, setIsEditingIngredient] = useState(false);
  const [ingredientUnits] = useState(['kg', 'g', 'liter', 'ml', 'pcs', 'can', 'slice', '']); // '' for unit-less/custom

  // States for Add Meal Item Modal (within Meal Modal)
  const [addMealItemModalVisible, setAddMealItemModalVisible] = useState(false);
  const [currentEditingMealItem, setCurrentEditingMealItem] = useState<MealItem | null>(null); // To store the meal item being edited
  const [newMealItemName, setNewMealItemName] = useState(''); // For typing ingredient name (add mode) or display (edit mode)
  const [newMealItemAmount, setNewMealItemAmount] = useState('');


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const openNewMealModal = () => {
    setCurrentMeal({ name: '', items: [], multiplier: 1, isIngredient: false });
    setIsEditingMeal(false);
    setMealModalVisible(true);
  };

  const openEditMealModal = (meal: Meal) => {
    setCurrentMeal({ ...meal }); // Use spread to ensure all properties are copied
    setIsEditingMeal(true);
    setMealModalVisible(true);
  };

  const handleSaveMeal = () => {
    if (!currentMeal.name) {
      alert("Meal name cannot be empty."); // Basic validation
      return;
    }
    if (isEditingMeal && currentMeal.id) {
      editMeal(currentMeal as Meal);
    } else {
      // Ensure items is an array, even if not yet implemented in UI
      const mealToSave: Omit<Meal, 'id'> = {
        name: currentMeal.name || 'Unnamed Meal',
        items: currentMeal.items || [],
        multiplier: currentMeal.multiplier || 1,
        isIngredient: currentMeal.isIngredient || false,
      };
      addMeal(mealToSave);
    }
    setMealModalVisible(false);
    setCurrentMeal({}); // Reset current meal
  };

  const openNewIngredientDetailModal = () => {
    setCurrentIngredient({ name: '', price: 0, unit: ingredientUnits[0] });
    setIsEditingIngredient(false);
    setIngredientDetailModalVisible(true);
  };

  const openEditIngredientModal = (ingredient: Ingredient) => {
    setCurrentIngredient({ ...ingredient });
    setIsEditingIngredient(true);
    setIngredientDetailModalVisible(true);
  };

  const handleDeleteMealItem = (ingredientIdToDelete: string) => {
    // This function updates the local currentMeal state.
    // The actual deletion from the meal in useMealData hook happens when the meal is saved.
    const updatedItems = (currentMeal.items || []).filter(item => item.ingredientId !== ingredientIdToDelete);
    setCurrentMeal(prev => ({...(prev || {}), items: updatedItems}));
  };

  const handleSaveIngredient = () => {
    if (!currentIngredient.name || currentIngredient.price === undefined) { // check price for undefined specifically
      alert("Ingredient name and price are required.");
      return;
    }
    if (isEditingIngredient && currentIngredient.id) {
      editIngredient(currentIngredient as Ingredient);
    } else {
      addIngredient({
        name: currentIngredient.name || 'Unnamed Ingredient',
        price: currentIngredient.price || 0,
        unit: currentIngredient.unit || '',
      });
    }
    setIngredientDetailModalVisible(false); // Close detail modal
    setCurrentIngredient({}); // Reset
    // Keep manageIngredientsModalVisible true or handle as needed
  };

  // Price calculation functions are now imported.
  // Calls to these functions will need to be updated to pass `ingredients` and `meals` lists.

  const renderMealItem = ({ item: meal }: { item: Meal }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{meal.name} (x{meal.multiplier})</Title>
        <Paragraph>Ingredients:</Paragraph>
        {meal.items.map(mealItem => {
          const ingredient = ingredients.find(ing => ing.id === mealItem.ingredientId);
          // Placeholder for meal as ingredient
          const subMeal = meals.find(m => m.id === mealItem.ingredientId && m.isIngredient);

          let name = 'Unknown Ingredient';
          let unit = '';
          if (ingredient) {
            name = ingredient.name;
            unit = ingredient.unit;
          } else if (subMeal) {
            name = `${subMeal.name} (Meal)`;
            unit = 'serving';
          }

          return (
            <Text key={mealItem.ingredientId}>
              - {name}: {mealItem.amount} {unit} (${calculateIngredientPrice(mealItem, ingredients).toFixed(2)})
            </Text>
          );
        })}
        <Paragraph style={{ fontWeight: 'bold', marginTop: 5 }}>
          Total Price: ${calculateMealTotalPrice(meal, ingredients, meals).toFixed(2)}
        </Paragraph>
        <View style={styles.checkboxContainer}>
            <Text>Is Ingredient:</Text>
            <Checkbox
                status={meal.isIngredient ? 'checked' : 'unchecked'}
                onPress={() => editMeal({ ...meal, isIngredient: !meal.isIngredient })}
            />
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => openEditMealModal(meal)}>Edit</Button>
        <Button onPress={() => deleteMeal(meal.id)}>Delete</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <PaperProvider theme={theme}>
      <ScreenWrapper>
        <Button icon="plus" mode="contained" onPress={openNewMealModal} style={styles.button}>
          Add New Meal
        </Button>
        <Button icon="plus-circle-outline" mode="outlined" onPress={() => setManageIngredientsModalVisible(true)} style={styles.button}>
          Manage Ingredients
        </Button>

        <FlatList
          data={meals}
          renderItem={renderMealItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<Text style={styles.listTitle}>Meals</Text>}
        />

        {/* Placeholder for Ingredients List - for testing */}
        {/* <Text style={styles.listTitle}>Ingredients (Dev)</Text>
        {ingredients.map(ing => (
          <Text key={ing.id}>{ing.name} - ${ing.price}/{ing.unit || 'unit'}</Text>
        ))} */}

        <Portal>
          {/* Meal Add/Edit Modal Placeholder */}
          <Modal visible={mealModalVisible} onDismiss={() => setMealModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Title>{isEditingMeal ? "Edit Meal" : "Add New Meal"}</Title>
            <TextInput
              label="Meal Name"
              value={currentMeal.name}
              onChangeText={text => setCurrentMeal(prev => ({ ...prev, name: text }))}
              style={styles.input}
            />
            <TextInput
              label="Multiplier"
              value={String(currentMeal.multiplier || 1)}
              onChangeText={text => setCurrentMeal(prev => ({ ...prev, multiplier: parseInt(text, 10) || 1 }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.checkboxContainerModal}>
              <Text>Mark as Ingredient (can be used in other meals):</Text>
              <Checkbox
                status={currentMeal.isIngredient ? 'checked' : 'unchecked'}
                onPress={() => setCurrentMeal(prev => ({ ...prev, isIngredient: !prev.isIngredient }))}
              />
            </View>

            <View style={styles.separator} />
            <Title style={styles.modalSectionTitle}>Ingredients in this Meal</Title>
            {currentMeal.items && currentMeal.items.length > 0 ? (
              <FlatList
                data={currentMeal.items}
                keyExtractor={(item, index) => item.ingredientId + index}
                renderItem={({ item: mealItem }) => {
                  const ingredient = ingredients.find(ing => ing.id === mealItem.ingredientId);
                  return (
                    <Card style={styles.listItemCardSmall}>
                      <Card.Content style={styles.mealItemContainer}>
                        <View style={styles.mealItemDetails}>
                          <Text style={styles.mealItemName}>{ingredient ? ingredient.name : 'Unknown Ingredient'}</Text>
                          <Text>Amount: {mealItem.amount} {ingredient ? ingredient.unit : ''}</Text>
                        </View>
                        <View style={styles.mealItemActions}>
                          <IconButton icon="pencil-outline" size={18} onPress={() => openEditMealItemModal(mealItem)} />
                          <IconButton icon="delete-outline" size={18} onPress={() => handleDeleteMealItem(mealItem.ingredientId)} />
                        </View>
                      </Card.Content>
                    </Card>
                  );
                }}
              />
            ) : (
              <Paragraph>No ingredients added to this meal yet.</Paragraph>
            )}
            <Button
              icon="plus-box-outline"
              mode="outlined"
              onPress={() => setAddMealItemModalVisible(true)}
              style={styles.button}
            >
              Add Ingredient to Meal
            </Button>
            <View style={styles.separator} />

            <Button mode="contained" onPress={handleSaveMeal} style={styles.button}>
              {isEditingMeal ? "Update Meal" : "Save Meal"}
            </Button>
            <Button onPress={() => setMealModalVisible(false)} style={styles.button}>
              Cancel
            </Button>
          </Modal>

          {/* Add/Edit Meal Item Modal */}
          <Modal visible={addMealItemModalVisible} onDismiss={closeAddEditMealItemModal} contentContainerStyle={styles.modalContainer}>
            <Title>{currentEditingMealItem ? "Edit Ingredient Amount" : "Add Ingredient to Meal"}</Title>
            <TextInput
              label="Ingredient Name"
              value={newMealItemName}
              onChangeText={setNewMealItemName}
              style={styles.input}
              disabled={!!currentEditingMealItem} // Disable if editing, name shouldn't change
              autoCapitalize="sentences"
            />
            <TextInput
              label="Amount"
              value={newMealItemAmount}
              onChangeText={setNewMealItemAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleSaveMealItem} style={styles.button}>
              {currentEditingMealItem ? "Update Amount" : "Add to Meal"}
            </Button>
            {!currentEditingMealItem && ( // Only show "Create New" when adding, not editing
              <Button onPress={openCreateNewIngredientFromMealItemModal} style={styles.button}>
                Create New Ingredient First
              </Button>
            )}
            <Button onPress={closeAddEditMealItemModal} style={styles.button}>
              Cancel
            </Button>
          </Modal>

          {/* Manage Ingredients Modal */}
          <Modal visible={manageIngredientsModalVisible} onDismiss={() => setManageIngredientsModalVisible(false)} contentContainerStyle={styles.modalContainerLarge}>
            <Title>Manage Ingredients</Title>
            <FlatList
              data={ingredients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.listItemCard}>
                  <Card.Content style={styles.listItemContainer}>
                    <View style={styles.listItemTextContainer}>
                      <Text style={styles.listItemName}>{item.name}</Text>
                      <Text style={styles.listItemDetails}>Price: ${item.price ? item.price.toFixed(2) : '0.00'} / {item.unit || 'unit'}</Text>
                    </View>
                    <View style={styles.listItemActions}>
                      <IconButton icon="pencil" onPress={() => openEditIngredientModal(item)} size={20} />
                      <IconButton icon="delete" onPress={() => deleteIngredient(item.id)} size={20} />
                    </View>
                  </Card.Content>
                </Card>
              )}
              ListEmptyComponent={<Text>No ingredients found. Add some!</Text>}
              style={{ maxHeight: '70%' }} // Ensure list doesn't overflow modal
            />
            <Button mode="contained" onPress={openNewIngredientDetailModal} style={styles.button}>
              Add New Ingredient
            </Button>
            <Button onPress={() => setManageIngredientsModalVisible(false)} style={styles.button}>
              Close
            </Button>
          </Modal>

          {/* Add/Edit Ingredient Detail Modal */}
          <Modal visible={ingredientDetailModalVisible} onDismiss={() => setIngredientDetailModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Title>{isEditingIngredient ? "Edit Ingredient" : "Add New Ingredient"}</Title>
            <TextInput
              label="Ingredient Name"
              value={currentIngredient.name || ''}
              onChangeText={text => setCurrentIngredient(prev => ({ ...prev, name: text }))}
              style={styles.input}
            />
            <TextInput
              label="Price"
              value={currentIngredient.price ? String(currentIngredient.price) : ''}
              onChangeText={text => setCurrentIngredient(prev => ({ ...prev, price: parseFloat(text) || 0 }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label={`Unit (e.g., ${ingredientUnits.slice(0,3).join(', ')} or blank)`}
              value={currentIngredient.unit || ''}
              onChangeText={text => setCurrentIngredient(prev => ({ ...prev, unit: text }))}
              placeholder={`Available: ${ingredientUnits.join(', ')}`}
              style={styles.input}
            />
            {/* Simple Text display for selected unit for now, Picker is more complex */}
            {/* <Text>Selected unit: {currentIngredient.unit}</Text> */}
            <Button mode="contained" onPress={handleSaveIngredient} style={styles.button}>
              {isEditingIngredient ? "Update Ingredient" : "Save Ingredient"}
            </Button>
            <Button onPress={() => setIngredientDetailModalVisible(false)} style={styles.button}>
              Cancel
            </Button>
          </Modal>

        </Portal>
      </ScreenWrapper>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  // wrapper style is removed as ScreenWrapper handles its own styling
  container: {
    flex: 1,
  },
  button: {
    marginVertical: 8,
  },
  card: {
    marginVertical: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalContainerLarge: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 8,
    maxHeight: '90%', // Adjusted for better fit
  },
  input: {
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  checkboxContainerModal: { // For use inside modal
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listItemCard: {
    marginBottom: 8,
    backgroundColor: theme.colors.surface, // Use theme color
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Reduced padding
    paddingHorizontal: 12, // Reduced padding
  },
  listItemTextContainer: {
    flex: 1, // Allow text to take available space
    marginRight: 8, // Add some space before buttons
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text, // Use theme color
  },
  listItemDetails: {
    fontSize: 12,
    color: theme.colors.placeholder, // Use theme color for secondary text
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center', // Align buttons nicely
  },
  // Styles for Meal Items within Meal Modal
  mealItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4, // Adjusted padding
    paddingHorizontal: 0, // No extra horizontal padding needed from Card.Content
  },
  mealItemDetails: {
    flex: 1,
    marginRight: 8,
  },
  mealItemName: {
    fontWeight: 'bold',
    color: theme.colors.text, // Use theme color
  },
  mealItemActions: {
    flexDirection: 'row',
  },
  listItemCardSmall: { // For items within a modal, less margin
    marginBottom: 6,
    backgroundColor: theme.colors.elevation.level1, // Use theme color for slight elevation
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  modalSectionTitle: {
    fontSize: 16, // Slightly smaller than main modal title
    fontWeight: 'bold',
    marginTop: 8, // Add some space before the title
    marginBottom: 8, // Add some space after the title
    color: theme.colors.onSurface, // Use theme color
  }
});

export default MealPlannerScreen;
