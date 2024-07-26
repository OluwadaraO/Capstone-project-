const {ALLERGENS, DIET_TYPES, DIETARY_PREFERENCES_TO_ALLERGENS, NUTRIENT_CONSTANTS} = require('./healthScoreConstants.js')

const calculateNutrientScores = (totalNutrients, calories) => {
    return{
        calories: 100 - Math.min((calories / NUTRIENT_CONSTANTS["calories"]) * 100, 100),
        protein: totalNutrients.PROCNT ? Math.min((totalNutrients.PROCNT.quantity / NUTRIENT_CONSTANTS["protein"]) * 100, 100) : 0,
        fat: totalNutrients.FAT ? Math.min((totalNutrients.FAT.quantity / NUTRIENT_CONSTANTS["fat"]) * 100, 100) : 0,
        carbs: totalNutrients.CHOCDF ? Math.min((totalNutrients.CHOCDF.quantity / NUTRIENT_CONSTANTS["carbs"]) * 100, 100) : 0,
        fiber: totalNutrients.FIBTG ? Math.min((totalNutrients.FIBTG.quantity / NUTRIENT_CONSTANTS["fiber"]) * 100, 100) : 0,
        sugar: totalNutrients.SUGAR ? 100 - Math.min((totalNutrients.SUGAR.quantity / NUTRIENT_CONSTANTS["sugar"]) * 100, 100) : 0,
        sodium: totalNutrients.NA ? 100 - Math.min((totalNutrients.NA.quantity / NUTRIENT_CONSTANTS["sodium"]) * 100, 100) : 0,
    };
};

const calculateNutrientValue = (totalNutrients, calories) => {
    return{
        calories,
        protein: totalNutrients.PROCNT ? totalNutrients.PROCNT.quantity: 0,
        fat: totalNutrients.FAT ? totalNutrients.FAT.quantity: 0,
        carbs: totalNutrients.CHOCDF ?totalNutrients.CHOCDF.quantity : 0,
        fiber: totalNutrients.FIBTG ? totalNutrients.FIBTG.quantity: 0,
        sugar: totalNutrients.SUGAR ? totalNutrients.SUGAR.quantity: 0,
        sodium: totalNutrients.NA ? totalNutrients.NA.quantity: 0,
    };
};

const calculateOverallNutrientScore = (nutrientScores) => {
    return Object.entries(nutrientScores).reduce((total, [key, value]) => {
        const weight = key === 'calories' ? 0.2 : 0.1;
        return total + value * weight;
    }, 0)/Object.keys(nutrientScores).length;
};

const calculateDietaryCompatibilityScore = (dietTypes, dietLabels) => {
    return dietTypes.length > 0 ?
        dietTypes.reduce((score, type) => {
            const compatibility = dietLabels.includes(type) ? 100 : 0;
            return score + compatibility;
    }, 0) / dietTypes.length
    : 0;
};

const checkAllergenImpact = (allergens, recipe) => {
    return allergens.some(allergen =>
        recipe.ingredientLines.some(ingredient => ingredient.toLowerCase().includes(allergen.toLowerCase()))
    ) ? 0 : 100;
};

const calculateNutrientImpactScore = (totalNutrients, nutrients) => {
    return nutrients.reduce((score, nutrient) => {
        const nutrientValue = totalNutrients[nutrient] ? totalNutrients[nutrient].quantity : 0;
        return score + Math.min((nutrientValue / 100) * 100, 100)
    }, 0)/nutrients.length;
};

const calculateHealthLabelImpact = (healthLabels, totalNutrients, dietLabels) => {
    return healthLabels.reduce((score, label) => {
        switch(label){
            case 'Sugar-Conscious': {
                return score + (totalNutrients.SUGAR ? (100 - Math.min((totalNutrients.SUGAR.quantity / 50) * 100, 100)) : 100);
            }
            case 'Low-Fat': {
                return score + (totalNutrients.FAT ? (100 - Math.min((totalNutrients.FAT.quantity / 70) * 100, 100)) : 100);
            }
            case 'Low-Sodium':{
                return score + (totalNutrients.NA ? (100 - Math.min((totalNutrients.NA.quantity / 2300) * 100, 100)) : 100);
            }
            case 'Keto-Friendly':{
                return score + (dietLabels.includes('Low-Carb') ? 100 : 0);
            }
            case 'Immuno-Supportive':{
                const vitCScore = totalNutrients.VITC ? Math.min((totalNutrients.VITC.quantity / 60) * 100, 100) : 0;
                const vitAScore = totalNutrients.VITA_RAE ? Math.min((totalNutrients.VITA_RAE.quantity / 900) * 100, 100) : 0;
                const zincScore = totalNutrients.ZN ? Math.min((totalNutrients.ZN.quantity / 11) * 100, 100) : 0;
                const VITDScore = totalNutrients.VITD ? Math.min((totalNutrients.VITD.quantity / 10) * 100, 100) : 0;
                const immuneSupportScore = (vitAScore + vitCScore + zincScore + VITDScore) / 4;
                return score + immuneSupportScore;
            }
            case 'Vegan' :
            case 'Soy-Free':
            case 'Vegetarian':
                return score + (healthLabels.includes(label)? 100 : 0)
            default:
                return score;
        }
    }, 0);
};

const getHealthScoreColor = (score) => {
    if (score < 10)
        return 'red';

    if (score < 30)
        return 'pink'

    if (score < 50)
        return 'orange'

    if (score === 50)
        return 'yellow'

    if (score < 70)
        return 'light green'

    if (score < 85)
        return 'dark green'

    return 'green'
}

const calculateHealthScore = (recipe, userPreferences) => {
    const {
        calories,
        totalNutrients,
        dietLabels,
        healthLabels,
    } = recipe;

    const {
        dietaryPreferences = [],
        allergens = dietaryPreferences.reduce((acc, preference) => {
            const allergen = DIETARY_PREFERENCES_TO_ALLERGENS[preference];
            if (allergen){
                acc.push(allergen)
            }
            return acc;
        }, []),
        dietTypes = DIET_TYPES.filter(dietType => dietaryPreferences.includes(dietType))
    } = userPreferences

    const weightFactors = {
        nutrients: 0.4,
        dietaryCompatibility: 0.3,
        healthImpact: 0.2,
        environmentalImpact: 0.1,
    }

    const nutrientScores = calculateNutrientScores(totalNutrients, calories)

    const nutrientValues = calculateNutrientValue(totalNutrients, calories)

    //Calculate overrall nutrient score using a weighted average
    //Calories are given more weight in the calculation than other nutrients.
    const nutrientScore = calculateOverallNutrientScore(nutrientScores)

    //Calculate Dietary Compatibility Score
    const dietaryCompatibilityScore = calculateDietaryCompatibilityScore(dietTypes, dietLabels)

    //Check for allergens
    const allergenImpact = checkAllergenImpact(allergens, recipe)

    //Calculate Health Score
    //FIBTG: Fiber, CHOLE: Cholesterol, VITA_RAE: Vitamin A, NA: Sodium
    const positiveNutrients = ['FIBTG', 'VITC', 'K', 'VITA_RAE'];
    const negativeNutrients = ['SUGAR', 'NA', 'CHOLE', 'FAT']

    const positiveNutrientScore = calculateNutrientImpactScore(totalNutrients, positiveNutrients)
    const negativeNutrientScore = 100 - calculateNutrientImpactScore(totalNutrients, negativeNutrients)

    const healthLabelImpact = calculateHealthLabelImpact(healthLabels, totalNutrients, dietLabels)
    const healthImpactScore = (healthLabelImpact + positiveNutrientScore + negativeNutrientScore) / 3;

    const healthScore =
        nutrientScore * weightFactors.nutrients +
        dietaryCompatibilityScore * weightFactors.dietaryCompatibility +
        allergenImpact * weightFactors.healthImpact +
        healthImpactScore * weightFactors.healthImpact;

    const normalizedHealthScore = Math.max(0, Math.min(healthScore, 100));
    const color = getHealthScoreColor(normalizedHealthScore)

    return {score: normalizedHealthScore, color, nutrients: nutrientValues};
};

module.exports = calculateHealthScore;
