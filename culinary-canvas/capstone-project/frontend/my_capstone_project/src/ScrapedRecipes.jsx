import React, { useState, useEffect } from 'react';
import { useAuth } from './RedirectToAuthentication';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ImportRecipeButton from './ImportRecipeButton';
import './ScrapedRecipes.css';
const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
function ScrapedRecipes() {
  const [scrapedRecipes, setScrapedRecipes] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user) {
        navigate('/');
      }
      const fetchScrapedRecipe = async () => {
        try {
          const response = await fetch(`${backendAddress}/scraped-recipes/${user.id}`, {
            method: 'GET',
            credentials: 'include',
          });
          const data = await response.json();
          setScrapedRecipes(data);
        } catch (error) {
          console.error('Error fetching scraped recipes');
        }
      };
      fetchScrapedRecipe();
    }
  }, [user, isAuthenticated]);

  const handleRecipeAdded = (newRecipe) => {
    setScrapedRecipes((prevRecipes) => [...prevRecipes, newRecipe]);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteImportedRecipes = async (id) => {
    try {
      const response = await fetch(`${backendAddress}/scraped-recipes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        alert('Recipe deleted sucessfully!');
        setScrapedRecipes(scrapedRecipes.filter((scrapedRecipe) => scrapedRecipe.id !== id));
      } else {
        console.error('Failed to delete imported recipe');
      }
    } catch (error) {
      console.error('Error', error);
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
      <h2>Recipes Added By You</h2>
      <div className='quick-links'>
        <img
          src="../house-solid.svg"
          alt="home page"
          onClick={handleHomePage}
          className="home-page"
          title="Back to home page"
        />
        <img
          src="../user-solid.svg"
          alt="user-profile"
          onClick={handleUserPage}
          className="user-page"
          title="Back to my page"
        />
        <button
          onClick={openModal}
          title="Want to keep other recipes here? Submit the link to that website!"
          className='import-recipe'
        >
          Import Recipe Url
        </button>
      </div>
      {scrapedRecipes.length > 0 && user ? (
        <ul>
          {scrapedRecipes.map((recipe) => (
            <li key={recipe.id}>
              <div className="scraped-recipes">
                <img src={recipe.imageUrl} alt={recipe.title} className="scraped-recipe-image" />
                <h3>{recipe.title}</h3>
                <ol>{recipe.ingredients}</ol>
                <p>Calories: {recipe.calories}</p>
                <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                  View Recipe
                </a>
                <button onClick={() => handleDeleteImportedRecipes(recipe.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recipes have been added. Please import a url to add a recipe</p>
      )}
      {isModalOpen && <ImportRecipeButton onClose={closeModal} onRecipeAdded={handleRecipeAdded} />}
    </div>
  );
}
export default ScrapedRecipes;
