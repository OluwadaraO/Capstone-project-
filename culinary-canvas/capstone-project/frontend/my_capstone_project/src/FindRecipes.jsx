import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from './RedirectToAuthentication';
import LoadingSpinner from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import './FindRecipes.css'
function FindRecipes() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState(['']);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
  const navigate = useNavigate();

  const handleInputChange = (index, event) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = event.target.value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${backendAddress}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ingredients }),
      });
      if (response.ok) {
        setLoading(false);
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching recipes: ', error);
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      const response = await fetch(`${backendAddress}/recipes/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.id,
          recipeName: recipe.label,
          recipeImage: recipe.image,
        }),
      });
      if (response.ok) {
        alert('Recipe saved successfully!');
      }
    } catch (error) {
      console.error('Error saving recipes: ', error);
    }
  };

  const handleLikeRecipe = async (recipe) => {
    try {
      const response = await fetch(`${backendAddress}/recipes/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.id,
          recipeName: recipe.label,
          recipeImage: recipe.image,
        }),
      });
      if (response.ok) {
        alert('Recipe liked successfully!');
      }
    } catch (error) {
      console.error('Error fetching recipe: ', error);
    }
  };
  const handleHomePage = () => {
    navigate('/');
  };
  const handleUserPage = () => {
    navigate('/login/:id');
  };
  return (
    <div>
      <div className='quick-links'>
        <img
          src="../house-solid.svg"
          alt="home page"
          onClick={handleHomePage}
          className="home-page"
          title="Back to Home Page"
        />
        <img
          src="../user-solid.svg"
          alt="user-profile"
          onClick={handleUserPage}
          className="user-page"
          title="Back to my page"
        />
      </div>
      <div className="find-recipes-container">
        <form onSubmit={handleSubmit}>
          <h2>Find Recipes</h2>
          {ingredients.map((ingredient, index) => (
            <div key={index}>
              <label className='ingredient'>
                Ingredient {index + 1}
                <input
                  type="text"
                  value={ingredient}
                  onChange={(event) => handleInputChange(index, event)}
                  className='ingredient-text'
                />
              </label>
              {index > 0 && (
                <button type="button" onClick={() => handleRemoveIngredient(index)} className='remove-ingredient'>
                  Remove Ingredient
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient} className='add-ingredient'>
            Add Ingredient
          </button>
          <button type="submit" className='result'>Submit</button>
        </form>
        {loading && <LoadingSpinner />}
        <div className="recipes">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <img src={recipe.image} alt={recipe.label} />
              <h3>{recipe.label}</h3>
              <button onClick={() => handleSaveRecipe(recipe)} className='saved'>Save Recipe</button>
              <button onClick={() => handleLikeRecipe(recipe)} className='likes'>Like</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default FindRecipes;
