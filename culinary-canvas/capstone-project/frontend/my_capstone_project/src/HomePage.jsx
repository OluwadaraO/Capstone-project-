import "./HomePage.css";
import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./RedirectToAuthentication";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import RecipeOfTheDay from "./RecipeOfTheDay";
import MealPlannerModal from "./MealPlannerModal";
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
    "pasta",
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
  //state to manage recipe ratings
  const [recipeRatings, setRecipeRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [selectedRecipe, setSelectedrecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchSavedRecipes = async () => {
        try {
          const response = await fetch(
            `${backendAddress}/recipes/save/${user.id}`,
            {credentials: 'include'}
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
            {credentials: 'include'}
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
    let url = `${backendAddress}/recipes?`;

    if (searchQuery) {
      url += `category=${searchQuery}&`;
    }
    if (filterQueries.length > 0) {
      let filtersParam = filterQueries.map((f) => `health=${f}`).join("&");
      url += `${filtersParam}`;
    }
    try {
      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Expected data to be an array");
      }
      for (let recipe of data) {
        const encodedRecipeId = encodeURIComponent(recipe.uri);
        const ratingsResponse = await fetch(
          `${backendAddress}/recipes/${encodedRecipeId}/ratings`,
          {credentials: 'include'}
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
            {credentials: 'include'}
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
    if (card && card.classList) {
      card.classList.toggle("active");
    }
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
    const recipeId = recipe.uri;
    if (likedRecipes.some((liked) => liked.recipeId === recipeId)) {
      await fetch(`${backendAddress}/recipes/unlike`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          recipeId: recipe.uri,
        }),
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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

  const handleAddToPlanner = async(day, mealType, recipe) => {
    try{
      const response = await fetch(`${backendAddress}/meal-planner/add`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({
          userId : user.id,
          day,
          mealType,
          recipeId: recipe.uri,
          recipeName: recipe.label,
          recipeImage: recipe.image,
          recipeUrl: recipe.url,
        }),
        credentials: 'include',
      });
      if(response.ok){
        alert(`Added ${recipe.label} to ${day}`);
        setIsModalOpen(false)
      }else{
        const data = await response.json();
        alert(`Failed to add recipe to planner: ${data.error}`)
      }
    }catch(error){
      console.error("Error adding recipe to planner: ", error);
      alert("Failed to add recipe to planner")
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
      <div className="top-section">
        <div className="top-info">
          <h1>
            <span>Culinary Canvas</span>
          </h1>
          <p>The best place to leave your taste buds tingling</p>
          <Link to="/login">
            <button className="top-section-button">
              Want to join in on the fun?Click here to join!
            </button>
          </Link>
        </div>
        <div className="top-image">
          <img src="../top-image-background-chanwalrus.jpg" />
        </div>
        <div className="top-recipe-cards">
          <div className="top-recipe-card">
            <img
              src="../top-image-background-macaroons.jpg"
              alt="recipe-card-background-image"
            />
            <h3>Tasty Snacks</h3>
          </div>
          <div className="top-recipe-card">
            <img
              src="../top-image-background-onions.jpg"
              alt="recipe-card-background-image"
            />
            <h3>Tasty Meals</h3>
          </div>
          <div className="top-recipe-card">
            <img
              src="../top-image-background-pancakes.jpg"
              alt="recipe-card-background-image"
            />
            <h3>Healthy Life</h3>
          </div>
        </div>
      </div>
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
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000" height="40px" width="40px" version="1.1" id="Capa_1" viewBox="0 0 611.999 611.999" xmlSpace="preserve">
          <g>
          <g>
            <g>
              <path d="M570.107,500.254c-65.037-29.371-67.511-155.441-67.559-158.622v-84.578c0-81.402-49.742-151.399-120.427-181.203     C381.969,34,347.883,0,306.001,0c-41.883,0-75.968,34.002-76.121,75.849c-70.682,29.804-120.425,99.801-120.425,181.203v84.578     c-0.046,3.181-2.522,129.251-67.561,158.622c-7.409,3.347-11.481,11.412-9.768,19.36c1.711,7.949,8.74,13.626,16.871,13.626     h164.88c3.38,18.594,12.172,35.892,25.619,49.903c17.86,18.608,41.479,28.856,66.502,28.856     c25.025,0,48.644-10.248,66.502-28.856c13.449-14.012,22.241-31.311,25.619-49.903h164.88c8.131,0,15.159-5.676,16.872-13.626     C581.586,511.664,577.516,503.6,570.107,500.254z M484.434,439.859c6.837,20.728,16.518,41.544,30.246,58.866H97.32     c13.726-17.32,23.407-38.135,30.244-58.866H484.434z M306.001,34.515c18.945,0,34.963,12.73,39.975,30.082     c-12.912-2.678-26.282-4.09-39.975-4.09s-27.063,1.411-39.975,4.09C271.039,47.246,287.057,34.515,306.001,34.515z      M143.97,341.736v-84.685c0-89.343,72.686-162.029,162.031-162.029s162.031,72.686,162.031,162.029v84.826     c0.023,2.596,0.427,29.879,7.303,63.465H136.663C143.543,371.724,143.949,344.393,143.97,341.736z M306.001,577.485     c-26.341,0-49.33-18.992-56.709-44.246h113.416C355.329,558.493,332.344,577.485,306.001,577.485z"/>
              <path d="M306.001,119.235c-74.25,0-134.657,60.405-134.657,134.654c0,9.531,7.727,17.258,17.258,17.258     c9.531,0,17.258-7.727,17.258-17.258c0-55.217,44.923-100.139,100.142-100.139c9.531,0,17.258-7.727,17.258-17.258     C323.259,126.96,315.532,119.235,306.001,119.235z"/>
            </g>
          </g>
        </g>
        </svg>
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
                <p>Health Score : {" "}
                <span style={{color: result.healthColor}}>
                  {result.healthScore}
                </span>
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(result);
                }}
              >
                {isRecipeSaved(result.uri)
                  ? "Added to Saved"
                  : "Add to Saved"}
              </button>
              <button onClick={() => {setSelectedrecipe(result); setIsModalOpen(true); }}>
                +
              </button>
              <a
                href={result.url}
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
                              ? recipeRatings[recipeData.uri]
                                  .averageRating
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
                          {isRecipeLiked(recipeData.uri)
                            ? "Unlike"
                            : "Like"}
                        </button>
                        <p>Likes: {recipeData.likes}</p>
                        {recipeData.healthScore && (
                          <p>Health Score : {" "}
                            <span style={{color: recipeData.healthColor}}>
                              {recipeData.healthScore}
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
                        <button onClick={() => {setSelectedrecipe(recipeData); setIsModalOpen(true)}}>
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
      <MealPlannerModal recipe={selectedRecipe} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddToPlanner={handleAddToPlanner}/>
    </>
  );
}
export default HomePage;
