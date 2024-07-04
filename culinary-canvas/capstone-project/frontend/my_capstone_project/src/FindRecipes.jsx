import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "./RedirectToAuthentication";
import LoadingSpinner from "./LoadingSpinner";
function FindRecipes() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState(["", "", ""]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ingredients }),
      });
      if (response.ok) {
        setLoading(false);
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Error fetching recipes: ", error);
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      const response = await fetch("http://localhost:3000/recipes/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.id,
          recipeName: recipe.label,
          recipeImage: recipe.image,
        }),
      });
      if (response.ok) {
        alert("Recipe saved successfully!");
      }
    } catch (error) {
      console.error("Error saving recipes: ", error);
    }
  };

  const handleLikeRecipe = async (recipe) => {
    try {
      const response = await fetch("http://localhost:3000/recipes/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.id,
          recipeName: recipe.label,
          recipeImage: recipe.image,
        }),
      });
      if (response.ok) {
        alert("Recipe liked successfully!");
      }
    } catch (error) {
      console.error("Error fetching recipe: ", error);
      console.log(error);
    }
  };
  return (
    <div>
      <Link to="/">
        <button>Back to Home Page</button>
      </Link>
      <Link to="/login/:id">
        <button>Back to user's page</button>
      </Link>
      <div className="find-recipes-container">
        <form onSubmit={handleSubmit}>
          <h2>Find Recipes</h2>
          <div>
            <label>
              Ingredient 1:
              <input
                type="text"
                name="ingredient1"
                value={ingredients[0]}
                onChange={(e) => handleInputChange(0, e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Ingredient 2:
              <input
                type="text"
                name="ingredient2"
                value={ingredients.ingredient2}
                onChange={(e) => handleInputChange(1, e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Ingredient 3:
              <input
                type="text"
                name="ingredient1"
                value={ingredients.ingredient3}
                onChange={(e) => handleInputChange(2, e.target.value)}
              />
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
        {loading && <LoadingSpinner />}
        <div className="recipes">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <img src={recipe.image} alt={recipe.label} />
              <h3>{recipe.label}</h3>
              <button onClick={() => handleSaveRecipe(recipe)}>
                Save Recipe
              </button>
              <button onClick={() => handleLikeRecipe(recipe)}>Like</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default FindRecipes;
