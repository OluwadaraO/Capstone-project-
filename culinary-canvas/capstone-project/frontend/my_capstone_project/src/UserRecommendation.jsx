import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./RedirectToAuthentication";
import LoadingSpinner from "./LoadingSpinner";

function UserRecommendation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cookingLevel, setCookingLevel] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const dietaryLabels = [
    "Gluten-free",
    "Sugar-Conscious",
    "Kidney-Friendly",
    "Egg-Free",
    "Peanut-Free",
    "Tree-Nut-Free",
    "Soy-Free",
    "Fish-Free",
    "Shellfish-Free",
    "Pork-Free",
    "Red-Meat-Free",
    "Crustacean-Free",
    "Celery-Free",
    "Mustard-Free",
    "Sesame-Free",
    "Lupine-Free",
    "Mollusk-Free",
    "Alcohol-Free",
    "Sulfite-Free",
    "Vegetarian",
    "Pescatarian",
    "Wheat-Free",
    "Kosher",
    "Immuno-Supportive",
  ];
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setDietaryPreferences((prev) =>
      checked ? [...prev, value] : prev.filter((pref) => pref !== value)
    );
  };

  const handleFavoriteFoodChange = (index, event) => {
    const newFavoriteFoods = [...favoriteFoods];
    newFavoriteFoods[index] = event.target.value;
    setFavoriteFoods(newFavoriteFoods);
  };

  const handleAddFavoriteFood = () => {
    const lastFood = favoriteFoods[favoriteFoods.length - 1];
    if (favoriteFoods.length > 0 && lastFood.trim() === "") {
      alert("Please fill in the current favorite food before adding a new one");
      return;
    }
    if (favoriteFoods.length <= 10) {
      setFavoriteFoods([...favoriteFoods, ""]);
    } else if (favoriteFoods.length > 10) {
      alert("You can only add up to 10 favorite foods");
    }
  };

  const handleRemoveFavoriteFood = (index) => {
    const newFavoriteFoods = favoriteFoods.filter((_, i) => i !== index);
    setFavoriteFoods(newFavoriteFoods);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (user) {
      try {
        const response = await fetch(`${backendAddress}/save-preferences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            cookingLevel,
            dietaryPreferences,
            favoriteFoods: favoriteFoods.filter((food) => food.trim() !== ""),
          }),
          credentials: "include",
        });
        if (response.ok) {
          alert("Preferences saved successfully. Please log in now");
          navigate("/login");
        } else {
          alert("Profile Set Up Failed");
        }
      } catch (error) {
        console.error("Error during profile setup: ", error);
        alert("Profile Set Up Failed");
      } finally {
        setLoading(false);
      }
    } else {
      alert("User is not authenticated");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Profile SetUp</h2>
      <div>
        <label>Cooking Level: </label>
        <select
          value={cookingLevel}
          onChange={(e) => setCookingLevel(e.target.value)}
          required
        >
          <option value="">Select your cooking level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced learner">Advanced Learner</option>
          <option value="Professional">Professional</option>
        </select>
      </div>
      <div>
        <label>Dietary Preferences (Optional): </label>
        <div>
          {dietaryLabels.map((label) => (
            <label key={label}>
              <input
                type="checkbox"
                value={label}
                checked={dietaryPreferences.includes(label)}
                onChange={handleCheckboxChange}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label>Favorite Foods (Optional): </label>
        {favoriteFoods.map((food, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Enter a favorite food"
              value={food}
              onChange={(e) => handleFavoriteFoodChange(index, e)}
            />
            <button
              type="button"
              onClick={() => handleRemoveFavoriteFood(index)}
            >
              Remove
            </button>
          </div>
        ))}
        {favoriteFoods.length <= 10 && (
          <button type="button" onClick={handleAddFavoriteFood}>
            Add Favorite Food
          </button>
        )}
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Preferences"}
      </button>
      {loading && <LoadingSpinner />}
    </form>
  );
}
export default UserRecommendation;
