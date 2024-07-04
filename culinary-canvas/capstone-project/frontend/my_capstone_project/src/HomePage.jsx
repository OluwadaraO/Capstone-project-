import "./HomePage.css";
import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./RedirectToAuthentication";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";
function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logOut } = useAuth();
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
  ];
  //state to manage search query
  const [query, setQuery] = useState("");
  //state to manage search results
  const [searchResults, setSearchResults] = useState([]);
  //state to manage loading
  const [isLoading, setIsLoading] = useState(true);
  //state to manage search button text
  const [isSearching, setIsSearching] = useState(false);
  //state to manage category filter
  const [filters, setFilters] = useState([]);
  //state to manage savedRecipes
  const [savedRecipes, setSavedRecipes] = useState([]);
  //state to manage liked recipes
  const [likedRecipes, setLikedRecipes] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchSavedRecipes = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/recipes/save/${user.id}`
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
            `http://localhost:3000/recipes/liked/${user.id}`
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
  const fetchRecipies = async (searchQuery, filterQueries) => {
    let url = `http://localhost:3000/recipes?`;

    if (searchQuery) {
      url += `category=${searchQuery}&`;
    }
    if (filterQueries.length > 0) {
      let filtersParam = filterQueries.map((f) => `health=${f}`).join("&");
      url += `${filtersParam}`;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  useEffect(() => {
    if (query.length > 0 || filters.length > 0) {
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        const results = await fetchRecipies(query, filters);
        setSearchResults(results);
        setIsLoading(false);
        setIsSearching(true);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [query, filters]);

  useEffect(() => {
    const fetchAllRecipes = async () => {
      //stores recipies for all queries
      const allRecipes = {};
      for (let query of queries) {
        const recipes = await fetchRecipies(query, filters);
        allRecipes[query] = recipes;
      }
      setRecipes(allRecipes);
      setIsLoading(false);
    };
    fetchAllRecipes();
  }, [filters]);

  const handleRecipeCardClick = (e) => {
    const card = e.target.value;
    card.classList.toggle("active");
  };
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleSearchReset = () => {
    setQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const handleLike = async (recipe) => {
    const recipeId = recipe.recipe.uri;
    if (likedRecipes.some((liked) => liked.recipeId === recipeId)) {
      await fetch(`http://localhost:3000/recipes/unlike`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.recipe.uri,
        }),
      });
      setLikedRecipes(
        likedRecipes.filter((liked) => liked.recipeId !== recipeId)
      );
      updateRecipeLikes(recipeId, -1);
    } else {
      const response = await fetch(`http://localhost:3000/recipes/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.recipe.uri,
          recipeName: recipe.recipe.label,
          recipeImage: recipe.recipe.image,
        }),
      });
      const likedRecipe = await response.json();
      setLikedRecipes([...likedRecipes, likedRecipe]);
      updateRecipeLikes(recipeId, 1);
    }
  };

  const updateRecipeLikes = (recipeId, change) => {
    const updateLikes = (recipesList) => {
      return recipesList.map((recipe) => {
        if (recipe.recipe.uri === recipeId) {
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
    if (savedRecipes.some((saved) => saved.recipeId === recipe.recipe.uri)) {
      await fetch(`http://localhost:3000/recipes/unsaved`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.recipe.uri,
        }),
      });
      setSavedRecipes(
        savedRecipes.filter((saved) => saved.recipeId !== recipe.recipe.uri)
      );
    } else {
      const response = await fetch(`http://localhost:3000/recipes/saved`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.recipe.uri,
          recipeName: recipe.recipe.label,
          recipeImage: recipe.recipe.image,
        }),
      });
      const savedRecipe = await response.json();
      setSavedRecipes([...savedRecipes, savedRecipe]);
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
      <Header />
      {isAuthenticated && user ? (
        <div>
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
      <div className="filter-options">
        <label>
          <input
            type="checkbox"
            value="low-fat"
            checked={filters.includes("low-fat")}
            onChange={handleFilterChange}
          />
          Low Fat
        </label>
        <label>
          <input
            type="checkbox"
            value="alcohol-free"
            checked={filters.includes("alcohol-free")}
            onChange={handleFilterChange}
          />
          No Alcohol
        </label>
        <label>
          <input
            type="checkbox"
            value="vegan"
            checked={filters.includes("vegan")}
            onChange={handleFilterChange}
          />
          Vegan
        </label>
        <label>
          <input
            type="checkbox"
            value="vegetarian"
            checked={filters.includes("vegetarian")}
            onChange={handleFilterChange}
          />
          Vegetarian
        </label>
        <label>
          <input
            type="checkbox"
            value="egg-free"
            checked={filters.includes("egg-free")}
            onChange={handleFilterChange}
          />
          Egg-Free
        </label>
      </div>
      {isLoading && <LoadingSpinner />}
      {!isLoading && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div key={index} className="recipe-card">
              <img src={result.recipe.image} alt={result.recipe.label} />
              <h3>{result.recipe.label}</h3>
              <p>Calories: {Math.round(result.recipe.calories)}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(result);
                }}
              >
                {isRecipeLiked(result.recipe.uri) ? "Unlike" : "Like"}
              </button>
              <p>Likes: {result.likes || 0}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(result);
                }}
              >
                {isRecipeSaved(result.recipe.uri)
                  ? "Added to Saved"
                  : "Add to Saved"}
              </button>
              <a
                href={result.recipe.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Recipe
              </a>
            </div>
          ))}
        </div>
      )}
      {!isLoading && searchResults.length === 0 && (
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
                        src={recipeData.recipe.image}
                        alt={recipeData.recipe.label}
                        onClick={handleHomePageClick}
                      />
                      <h3 onClick={handleHomePageClick}>
                        {recipeData.recipe.label}{" "}
                      </h3>
                      <p onClick={handleHomePageClick}>
                        Calories: {Math.round(recipeData.recipe.calories)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(recipeData);
                        }}
                      >
                        {isRecipeLiked(recipeData.recipe.uri)
                          ? "Unlike"
                          : "Like"}
                      </button>
                      <p>Likes: {recipeData.likes}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(recipeData);
                        }}
                      >
                        {isRecipeSaved(recipeData.recipe.uri)
                          ? "Added to Saved"
                          : "Add to Saved"}
                      </button>
                      <a
                        href={recipeData.recipe.url}
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
      )}
    </>
  );
}
export default HomePage;
