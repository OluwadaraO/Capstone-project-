import React, { useState, useEffect } from "react";
import { useAuth } from "./RedirectToAuthentication";

function SavedRecipes() {
  const { user, logOut } = useAuth();
  const [savedRecipe, setSavedRecipe] = useState([]);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  const fetchSavedRecipes = async () => {
    const response = await fetch(`${backendAddress}/recipes/save/${user.id}`);
    const data = await response.json();
    setSavedRecipe(data);
    
  };

  useEffect(() => {
    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);

  return (
    <div>
      {savedRecipe.length === 0 ? (
        <p>No saved recipes found</p>
      ) : (
        savedRecipe.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-card">
            <img src={recipe.recipeImage} alt={recipe.recipeName} />
            <h4>{recipe.recipeName}</h4>
          </div>
        ))
      )}
    </div>
  );
}
export default SavedRecipes;
