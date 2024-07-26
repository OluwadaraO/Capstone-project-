import "./HomePage.css";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./RedirectToAuthentication";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import RecipeOfTheDay from "./RecipeOfTheDay";
import MealPlannerModal from "./MealPlannerModal";
import RateLimitModal from "./RateLimitModal";
import NotificationModal from "./NotificationModal";
import Footer from "./Footer";
function HomePage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    logOut,
    showNotificationModal,
    setShowNotificationModal,
  } = useAuth();
  //state to store recipies for each query
  const [recipes, setRecipes] = useState({});
  //array of queries to fetch different categories of recipies
  const queries = [
    "chicken",
    "beef",
    "fish",
    "rice",
    "cookies",
    "cheese",
    "salad",
    "pasta",
  ];
  //filter options
  const filterCategories = {
    health: [
      { value: "alcohol-free", label: "No Alcohol" },
      { value: "vegan", label: "Vegan" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "egg-free", label: "Egg Free" },
      { value: "celery-free", label: "Celery Free" },
      { value: "crustacean-free", label: "Crustacean Free" },
      { value: "DASH", label: "DASH" },
      { value: "fish-free", label: " Fish Free" },
      { value: "fodmap-free", label: "Fodmap Free" },
      { value: "gluten-free", label: "Gluten Free" },
      { value: "immuno-supportive", label: "Immuno-supportive" },
      { value: "keto-friendly", label: "Keto Friendly" },
      { value: "kidney-friendly", label: "Kidney Friendly" },
      { value: "kosher", label: "Kosher" },
      { value: "low-potassium", label: "Low Potassium" },
      { value: "low-sugar", label: "Low Sugar" },
      { value: "lupine-free", label: "Lupine Free" },
      { value: "Mediterranean", label: "Mediterranean" },
      { value: "mollusk-free", label: "Mollusk Free" },
      { value: "mustard-free", label: "Mustard Free" },
      { value: "No-oil-added", label: "No oil added" },
      { value: "paleo", label: "Paleo" },
      { value: "peanut-free", label: "Peanut Free" },
      { value: "pecatarian", label: "Pescatarian" },
      { value: "pork-free", label: "Pork Free" },
      { value: "red-meat-free", label: "Red Meat Free" },
      { value: "sesame-free", label: "Sesame Free" },
      { value: "shellfish-free", label: "Shellfish Free" },
      { value: "soy-free", label: "Soy Free" },
      { value: "sugar-conscious", label: "Sugar-Conscious" },
      { value: "sulfite-free", label: "Sulfite-Free" },
      { value: "tree-nut-free", label: "Tree-Nut-Free" },
      { value: "wheat-free", label: "Wheat-Free" },
      { value: "Alcohol-Cocktail", label: "alcohol-cocktail" },
    ],
    mealType: [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "snack", label: "Snack" },
      { value: "teatime", label: "Teatime" },
    ],
    diet: [
      { value: "balanced", label: "Balanced" },
      { value: "high-fiber", label: "High Fiber" },
      { value: "high-protein", label: "High Protein" },
      { value: "low-carb", label: "Low Carb" },
      { value: "low-fat", label: "	Low Fat" },
      { value: "low-sodium", label: "Low Sodium" },
    ],
    cuisineType: [
      { value: "american", label: "American" },
      { value: "asian", label: "Asian" },
      { value: "british", label: "British" },
      { value: "caribbean", label: "Caribbean" },
      { value: "central europe", label: "Central Europe" },
      { value: "chinese", label: "Chinese" },
      { value: "eastern europe", label: "Eastern Europe" },
      { value: "french", label: "French" },
      { value: "greek", label: "Greek" },
      { value: "indian", label: "Indian" },
      { value: "italian", label: "Italian" },
      { value: "japanese", label: "Japanese" },
      { value: "korean", label: "Korean" },
      { value: "kosher", label: "Kosher" },
      { value: "mediterranean", label: "Mediterranean" },
      { value: "mexican", label: "Mexican" },
      { value: "middle eastern", label: "Middle Easternd" },
      { value: "nordic", label: "Nordic" },
      { value: "south american", label: "South American" },
      { value: "south east asian", label: "South East Asian" },
      { value: "world", label: "World" },
    ],
  };
  const [activeFilter, setActiveFilter] = useState({
    category: null,
    value: null,
  });
  //state to manage search query
  const [query, setQuery] = useState("");
  //state to manage search results
  const [searchResults, setSearchResults] = useState([]);
  //state to manage loading
  const [isLoading, setIsLoading] = useState(true);
  //state to manage search button text
  const [isSearching, setIsSearching] = useState(false);
  //constant to track if search is completed
  const [searchCompleted, setSearchCompleted] = useState(false);
  //state to manage savedRecipes
  const [savedRecipes, setSavedRecipes] = useState([]);
  //state to manage liked recipes
  const [likedRecipes, setLikedRecipes] = useState([]);
  //state to manage recipe ratings
  const [recipeRatings, setRecipeRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [selectedRecipe, setSelectedrecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchSavedRecipes = async () => {
        try {
          const response = await fetch(
            `${backendAddress}/recipes/save/${user.id}`,
            { credentials: "include" }
          );
          const data = await response.json();

          if (Array.isArray(data)) {
            setSavedRecipes(data);
          } else {
            setSavedRecipes([]);
          }
        } catch (error) {
          console.error(error);
          setSavedRecipes([]);
        }
      };
      fetchSavedRecipes();

      const fetchLikedRecipes = async () => {
        try {
          const response = await fetch(
            `${backendAddress}/recipes/liked/${user.id}`,
            { credentials: "include" }
          );
          const data = await response.json();
          if (Array.isArray(data)) {
            setLikedRecipes(data);
          } else {
            setLikedRecipes([]);
          }
        } catch (error) {
          console.error("Error fetching liked recipes: ", error);
          setLikedRecipes([]);
        }
      };
      fetchLikedRecipes();
    }
  }, [isAuthenticated, user]);

  //function to log out
  const LogOut = async () => {
    try {
      await logOut();
      alert("Logged Out Successfully");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  //if a user that isn't logged in clicks on a button take them to log out page
  function handleHomePageClick() {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }

  //function to fetch recipies for a given query from Edamam API
  const fetchRecipies = async (searchQuery, activeFilters) => {
    let url = `${backendAddress}/recipes?`;

    if (searchQuery) {
      url += `category=${searchQuery}&`;
    }
    if (activeFilters.category && activeFilter.value) {
      url += `${activeFilter.category}=${encodeURIComponent(
        activeFilter.value
      )}&`;
    }
    try {
      const response = await fetch(url, {
        credentials: "include",
      });
      if (response.status === 429) {
        setRateLimitModalOpen(true);
        setTimeout(() => setRateLimitModalOpen(false), 120000);
      }
      const data = await response.json();

      if (!Array.isArray(data)) {
        setRateLimitModalOpen(true);
        setTimeout(() => setRateLimitModalOpen(false), 120000);
      }
      for (let recipe of data) {
        const encodedRecipeId = encodeURIComponent(recipe.uri);
        const ratingsResponse = await fetch(
          `${backendAddress}/recipes/${encodedRecipeId}/ratings`,
          { credentials: "include" }
        );
        const ratingsData = await ratingsResponse.json();
        setRecipeRatings((prev) => ({
          ...prev,
          [recipe.uri]: {
            ratings: ratingsData.ratings,
            averageRating: ratingsData.averageRating,
          },
        }));
        if (isAuthenticated) {
          const userRatingResponse = await fetch(
            `${backendAddress}/recipes/${encodedRecipeId}/user-rating?userId=${user.id}`,
            { credentials: "include" }
          );
          const userRatingData = await userRatingResponse.json();

          setUserRatings((prev) => ({
            ...prev,
            [recipe.uri]: userRatingData.rating || 0,
          }));
        }
      }
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    if (query.length > 0) {
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        const results = await fetchRecipies(query, activeFilter);
        setSearchResults(results);
        setIsLoading(false);
        setIsSearching(true);
        setSearchCompleted(true);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setSearchCompleted(false);
    }
  }, [query, activeFilter]);

  useEffect(() => {
    const fetchAllRecipes = async () => {
      //stores recipies for all queries
      const allRecipes = {};
      for (let query of queries) {
        const recipes = await fetchRecipies(query, activeFilter);
        allRecipes[query] = recipes;
      }
      setRecipes(allRecipes);
      setIsLoading(false);
    };
    fetchAllRecipes();
  }, [query, activeFilter]);

  const handleRecipeCardClick = (e) => {
    const card = e.target.value;
    if (card && card.classList) {
      card.classList.toggle("active");
    }
  };
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleSearchReset = () => {
    setActiveFilter({ category: null, value: null });
    setQuery("");
    setSearchResults([]);
    setIsSearching(false);
    setSearchCompleted(true);
  };

  const handleFilterChange = (category, value) => {
    if (activeFilter.category === category && activeFilter.value === value) {
      setActiveFilter({ category: null, value: null });
    } else {
      setActiveFilter({ category, value });
    }
  };

  const handleLike = async (recipe) => {
    const recipeId = recipe.uri;
    if (likedRecipes.some((liked) => liked.recipeId === recipeId)) {
      await fetch(`${backendAddress}/recipes/unlike`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.uri,
        }),
        credentials: "include",
      });
      setLikedRecipes(
        likedRecipes.filter((liked) => liked.recipeId !== recipeId)
      );
      updateRecipeLikes(recipeId, -1);
    } else {
      const response = await fetch(`${backendAddress}/recipes/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.uri,
          recipeName: recipe.label,
          recipeImage: recipe.image,
        }),
        credentials: "include",
      });
      const likedRecipe = await response.json();
      setLikedRecipes([...likedRecipes, likedRecipe]);
      updateRecipeLikes(recipeId, 1);
    }
  };

  const updateRecipeLikes = (recipeId, change) => {
    const updateLikes = (recipesList) => {
      return recipesList.map((recipe) => {
        if (recipe.uri === recipeId) {
          return {
            ...recipe,
            likes: (recipe.likes || 0) + change,
          };
        }
        return recipe;
      });
    };
    setSearchResults((prevResults) => updateLikes(prevResults));
    setRecipes((prevRecipes) => {
      const updatedRecipes = {};
      for (const query in prevRecipes) {
        updatedRecipes[query] = updateLikes(prevRecipes[query]);
      }
      return updatedRecipes;
    });
  };

  const handleSave = async (recipe) => {
    if (savedRecipes.some((saved) => saved.recipeId === recipe.uri)) {
      await fetch(`${backendAddress}/recipes/unsaved`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.uri,
        }),
        credentials: "include",
      });
      setSavedRecipes(
        savedRecipes.filter((saved) => saved.recipeId !== recipe.uri)
      );
    } else {
      const response = await fetch(`${backendAddress}/recipes/saved`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.uri,
          recipeName: recipe.label,
          recipeImage: recipe.image,
        }),
        credentials: "include",
      });
      const savedRecipe = await response.json();
      setSavedRecipes([...savedRecipes, savedRecipe]);
    }
  };

  const handleRateRecipe = async (recipeId, rating) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(`${backendAddress}/recipes/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId,
          rating,
        }),
        credentials: "include",
      });
      const data = await response.json();

      setRecipeRatings((prev) => ({
        ...prev,
        [recipeId]: { ...prev[recipeId], averageRating: data.averageRating },
      }));

      setUserRatings((prev) => ({
        ...prev,
        [recipeId]: rating,
      }));
    } catch (error) {
      console.error("Error rating recipes", error);
    }
  };

  const handleAddToPlanner = async (day, mealType, recipe) => {
    try {
      const response = await fetch(`${backendAddress}/meal-planner/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          day,
          mealType,
          recipeId: recipe.uri,
          recipeName: recipe.label,
          recipeImage: recipe.image,
          recipeUrl: recipe.url,
        }),
        credentials: "include",
      });
      if (response.ok) {
        alert(`Added ${recipe.label} to ${day}`);
        setIsModalOpen(false);
      } else {
        const data = await response.json();
        alert(`Failed to add recipe to planner: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding recipe to planner: ", error);
      alert("Failed to add recipe to planner");
    }
  };

  const isRecipeSaved = (recipeId) => {
    return savedRecipes.some((saved) => saved.recipeId === recipeId);
  };

  const isRecipeLiked = (recipeId) => {
    return likedRecipes.some((liked) => liked.recipeId === recipeId);
  };

  return (
    <>
      <div className="culinary-canvas-top">
        <div id="culinary-canvas-title">
          <h1>Culinary Canvas</h1>
          <img src="./culincary-canvas-logo.png" />
        </div>
        <div className="culinary-canvas-user-information">
          {isAuthenticated && user ? (
            <div className="user-information">
              <Link to={`/login/${user.id}`}>
                <img
                  className="profile-picture"
                  src={user.imageUrl}
                  alt={`${user.name}'s profile picture`}
                />
              </Link>
              <p>Hi @{user.name}</p>
              <button id="LogOutButton" onClick={LogOut}>
                Log Out
              </button>
              <div>
                <Link to="/notifications">
                  <img src="./bell.png" id="notifications-bell"/>
                </Link>
              </div>
            </div>
          ) : (
            <div className="user-authentication">
              <button className="user-log-in">
                <Link to="/login">Log In</Link>
              </button>
              <button className="user-sign-up">
                <Link to="/create">Sign Up</Link>
              </button>
            </div>
          )}
        </div>
      </div>
      <RateLimitModal
        isOpen={isRateLimitModalOpen}
        onClose={() => setRateLimitModalOpen(false)}
      />
      {user && showNotificationModal && (
        <NotificationModal
          userId={user.id}
          onClose={() => setShowNotificationModal(false)}
        />
      )}
      <div className="search-form">
        <input
          type="text"
          placeholder="Search for recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button
          onClick={isSearching ? handleSearchReset : () => {}}
          className="search-button"
        >
          {isSearching ? "Back to Recommended Recipes" : "Search"}
        </button>
      </div>
      {isSearching && (
        <div className="filter-options">
          {Object.entries(filterCategories).map(([category, options]) => (
            <div key={category} className="filter-category">
              <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
              <select
                value={
                  activeFilter.category === category ? activeFilter.value : ""
                }
                onChange={(e) => handleFilterChange(category, e.target.value)}
              >
                <option value="">None</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      {isLoading && <LoadingSpinner />}

      {!isLoading && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div key={index} className="recipe-card">
              <img src={result.image} alt={result.label} />
              <h3>{result.label}</h3>
              <p>Calories: {Math.round(result.calories)}</p>
              <p>{result.totalTime}</p>
              <StarRating
                rating={userRatings[result.uri] || 0}
                averageRating={
                  recipeRatings[result.uri]
                    ? recipeRatings[result.uri].averageRating
                    : 0
                }
                onRate={(rating) => handleRateRecipe(result.uri, rating)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(result);
                }}
              >
                {isRecipeLiked(result.uri) ? "Unlike" : "Like"}
              </button>
              <p>Likes: {result.likes || 0}</p>
              {result.healthScore && (
                <p>
                  Health Score :{" "}
                  <span style={{ color: result.healthColor }}>
                    {Math.round(result.healthScore)} %
                  </span>
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(result);
                }}
              >
                {isRecipeSaved(result.uri) ? "Added to Saved" : "Add to Saved"}
              </button>
              <button
                onClick={() => {
                  setSelectedrecipe(result);
                  setIsModalOpen(true);
                }}
              >
                +
              </button>
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                View Recipe
              </a>
            </div>
          ))}
        </div>
      )}
      {!isLoading && searchCompleted && searchResults.length === 0 && (
        <div className="no-results">
          <p>
            No results found for your search. Please try different keywords or
            filter.
          </p>
        </div>
      )}
      {!isLoading && searchResults.length === 0 && !searchCompleted && (
        <div>
          <RecipeOfTheDay />
          <div className="recipe-sections">
            {/* loop through each query to create a section for each category */}
            {queries.map((query) => (
              <div key={query} className="recipe-section">
                <h2>
                  Recommended {query.charAt(0).toUpperCase() + query.slice(1)}{" "}
                  Recipes
                </h2>
                <div className="recipe-scroll">
                  {Array.isArray(recipes[query]) &&
                    recipes[query].length > 0 &&
                    recipes[query].map((recipeData, index) => (
                      <div
                        key={index}
                        className="recipe-card"
                        onClick={handleRecipeCardClick}
                      >
                        <img
                          src={recipeData.image}
                          alt={recipeData.label}
                          onClick={handleHomePageClick}
                        />
                        <h3 onClick={handleHomePageClick}>
                          {recipeData.label}{" "}
                        </h3>
                        <p onClick={handleHomePageClick}>
                          Calories: {Math.round(recipeData.calories)}
                        </p>
                        <p onClick={handleHomePageClick}>
                          Total Time : {recipeData.totalTime}
                        </p>
                        <StarRating
                          rating={userRatings[recipeData.uri] || 0}
                          averageRating={
                            recipeRatings[recipeData.uri]
                              ? recipeRatings[recipeData.uri].averageRating
                              : 0
                          }
                          onRate={(rating) =>
                            handleRateRecipe(recipeData.uri, rating)
                          }
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(recipeData);
                          }}
                        >
                          {isRecipeLiked(recipeData.uri) ? "Unlike" : "Like"}
                        </button>
                        <p>Likes: {recipeData.likes}</p>
                        {recipeData.healthScore && (
                          <p>
                            Health Score :{" "}
                            <span style={{ color: recipeData.healthColor }}>
                              {Math.round(recipeData.healthScore)} %
                            </span>
                          </p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(recipeData);
                          }}
                        >
                          {isRecipeSaved(recipeData.uri)
                            ? "Added to Saved"
                            : "Add to Saved"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedrecipe(recipeData);
                            setIsModalOpen(true);
                          }}
                        >
                          +
                        </button>
                        <a
                          href={recipeData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleHomePageClick}
                        >
                          View Recipe
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <MealPlannerModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToPlanner={handleAddToPlanner}
      />
      <Footer/>
    </>
  );
}
export default HomePage;
