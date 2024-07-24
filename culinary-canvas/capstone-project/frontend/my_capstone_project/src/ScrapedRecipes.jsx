import React, { useState, useEffect } from "react";
import { useAuth } from "./RedirectToAuthentication";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ImportRecipeButton from "./ImportRecipeButton";
import "./ScrapedRecipes.css";
const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
function ScrapedRecipes() {
  const [scrapedRecipes, setScrapedRecipes] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user) {
        navigate("/");
      }
      const fetchScrapedRecipe = async () => {
        try {
          const response = await fetch(
            `${backendAddress}/scraped-recipes/${user.id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          setScrapedRecipes(data);
        } catch (error) {
          console.error("Error fetching scraped recipes");
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
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        alert("Recipe deleted sucessfully!");
        setScrapedRecipes(
          scrapedRecipes.filter((scrapedRecipe) => scrapedRecipe.id !== id)
        );
      } else {
        console.error("Failed to delete imported recipe");
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <div>
      <h1>Welcome</h1>
      <h2>Recipes Added By You</h2>
      <Link to="/">
        <button>Back to Home Page</button>
      </Link>
      <Link to="/login/:id">
        <button>Back to User's Page</button>
      </Link>
      <button
        onClick={openModal}
        title="Want to keep other recipes here? Submit the link to that website!"
      >
        Import Recipe Url
      </button>
      {scrapedRecipes.length > 0 && user ? (
        <ul>
          {scrapedRecipes.map((recipe) => (
            <li key={recipe.id}>
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="scraped-recipe-image"
              />
              <h3>Title: {recipe.title}</h3>
              <ol>{recipe.ingredients}</ol>
              <p>Calories: {recipe.calories}</p>
              <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                {recipe.url}
              </a>
              <button onClick={() => handleDeleteImportedRecipes(recipe.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recipes have been added. Please import a url to add a recipe</p>
      )}
      {isModalOpen && (
        <ImportRecipeButton
          onClose={closeModal}
          onRecipeAdded={handleRecipeAdded}
        />
      )}
    </div>
  );
}
export default ScrapedRecipes;
