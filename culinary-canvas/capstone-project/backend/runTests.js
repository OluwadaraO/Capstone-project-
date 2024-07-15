const calculateHealthScore = require("./calculateHealthScore");
const testCases = [
    {
        description : "High protein, low-carb, no allergens",
        recipe:{
            calories: 500,
            totalNutrients:{
                PROCNT : {quantity: 30},
                FAT : {quantity: 10},
                CHOCDF : {quantity: 20},
                FIBTG : {quantity: 5},
                SUGAR : {quantity: 10},
                NA : {quantity: 100},
                VITC : {quantity: 60},
                VITA_RAE : {quantity: 900},
                ZN : {quantity: 11},
                VITD : {quantity:  10},
            },
            dietLabels:["High Protein", "Low-Carb"],
            healthLabels: ["Sugar-Conscious", "Keto-Friendly"],
            ingredientLines: ["chicken", "olive oil", "salt", "pepper"]
        },
        userPreferences:{
            dietaryPreferences: ["Sugar-Conscious"],
            allergens: [],
            dietTypes: ["Keto"]
        },
        expected:{
            score: 42,
            color: "orange"
        }
    },
    {
        description : "High fat, high sodium, contains allergens",
        recipe:{
            calories: 800,
            totalNutrients:{
                PROCNT : {quantity: 20},
                FAT : {quantity: 80},
                CHOCDF : {quantity: 50},
                FIBTG : {quantity: 10},
                SUGAR : {quantity: 25},
                NA : {quantity: 2500},
                VITC : {quantity: 20},
                VITA_RAE : {quantity: 400},
                ZN : {quantity: 5},
                VITD : {quantity:  5},
            },
            dietLabels:["High-Fat"],
            healthLabels: ["Low-Sodium"],
            ingredientLines: ["peanuts", "salt", "butter", "sugar"]
        },
        userPreferences:{
            dietaryPreferences: ["Peaut-Free", "Low-Sodium"],
            allergens: ["Peanuts"],
            dietTypes: ["Low-Carb"]
        },
        expected:{
            score: 7.5,
            color: "red"
        }
    }
];

const runTests = () => {
    let passed = 0;
    let failed = 0;

    testCases.forEach((testCase, index) => {
        const {description, recipe, userPreferences, expected} = testCase;
        const result = calculateHealthScore(recipe, userPreferences);

        console.log(`Running ${description}...`);
        console.log(`Expected: `, expected);
        console.log(`Received: `, result);

        const scoreDiff = Math.abs(result.score - expected.score) < 10;
        const colorMatch = result.color === expected.color;

        if (scoreDiff && colorMatch){
            console.log(`Test case ${index + 1} passed!`);
            passed++
        }else{
            console.error(`Test case ${index + 1} failed!`)
            failed++
        }
        console.log()
    });
    console.log(`Total passed: ${passed}!`);
    console.log(`Total failed: ${failed}`)
};

runTests()
