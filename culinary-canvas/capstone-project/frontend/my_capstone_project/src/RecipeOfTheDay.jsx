import React, { useEffect, useState } from "react";
import "./RecipeOfTheDay.css";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "./RedirectToAuthentication";
function RecipeOfTheDay() {
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    const fetchRecipeOfTheDay = async () => {
      try {
        const response = await fetch(`${backendAddress}/recipe-of-the-day`);
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error(`Error fetching recipe of the day`, error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipeOfTheDay();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="recipe-of-the-day">
      <h2 className="recipe-of-the-day-title">Recipe of The Day</h2>
      {recipe && (
        <>
          <div className="recipe-content">
            <div className="recipe-details">
              <h3>{recipe.label}</h3>
              <p className="recipe-description">
                {recipe.ingredientLines.join(", ")}
              </p>
              <div className="nutrition">
                <p>
                  Calories: <span>{Math.round(recipe.calories)}</span>
                </p>
                <p>
                  Proteins:{" "}
                  <span>
                    {recipe.totalNutrients.PROCNT.quantity.toFixed(1)}g
                  </span>
                </p>
                <p>
                  Fats:{" "}
                  <span>{recipe.totalNutrients.FAT.quantity.toFixed(1)}g</span>
                </p>
                <p>
                  Carbohydrates:{" "}
                  <span>
                    {recipe.totalNutrients.CHOCDF.quantity.toFixed(1)}g
                  </span>
                </p>
              </div>
              <p className="prep-time">Prep Time: {recipe.totalTime} mins</p>
              <a href={recipe.uri} target="_blank" rel="noopener noreferrer">
                View Full Recipe
              </a>
            </div>
            <div className="recipe-image">
              <img src={recipe.image} alt={recipe.label} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default RecipeOfTheDay;
