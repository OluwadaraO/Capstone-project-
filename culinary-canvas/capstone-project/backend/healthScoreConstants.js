const ALLERGENS = [
    'Peanuts', 'Gluten', 'Egg', 'Fish', 'Shellfish', 'Soy', 'Tree-Nut', 'Wheat', 'Dairy', 'Sesame',
    "Mustard"
];

const DIET_TYPES = [
    'Keto', 'Vegan', 'Vegetarian', 'Paleo', 'Low-Carb', 'Low-Fat', 'Whole30', 'Mediterranean', 'DASH', 'Flexitarian' ,"Kidney-Friendly",'Sugar-Conscious']

const DIETARY_PREFERENCES_TO_ALLERGENS = {
    'Peanut-Free' : 'Peanuts',
    "Gluten-free" : 'Gluten',
    "Egg-Free" : "Egg",
    "Fish-Free" : "Fish",
    "Shellfish-Free": "Shellfish",
    "Soy-Free" : "Soy",
    "Tree-Nut-Free" : "Tree Nuts",
    "Wheat-Free" : 'Wheat',
    "Dairy-Free" : 'Dairy',
    "Sesame-Free" : 'Sesame',
    "Mustard-Free" : "Mustard"
}

const NUTRIENT_CONSTANTS = {
    "calories": 2000,
    "protein" : 90,
    "fat": 70,
    "carbs" : 310,
    "fiber" : 5,
    "sugar" : 5,
    "sodium" : 200
}
module.exports = {ALLERGENS, DIET_TYPES, DIETARY_PREFERENCES_TO_ALLERGENS, NUTRIENT_CONSTANTS}
