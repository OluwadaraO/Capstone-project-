import React, { useState, useEffect } from "react";
import { useAuth } from "./RedirectToAuthentication";
function DietaryRestrictions() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    cookingLevel: "",
    dietaryPreferences: [],
    favoriteFoods: [],
  });
  const dietaryLabels = ["Gluten-free",
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
    "Immuno-Supportive"]
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    if (user) {
      const fetchPreferences = async () => {
        try {
          const response = await fetch(
            `${backendAddress}/preferences/${user.id}`
          );
          const data = await response.json();
          setPreferences({
            cookingLevel: data.cookingLevel || "",
            dietaryPreferences: data.dietaryPreferences|| [],
            favoriteFoods: data.favoriteFoods || [],
          });
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user preferences: ", error);
          setLoading(false);
        }
      };
      fetchPreferences();
    }
  }, [user, backendAddress]);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setPreferences((prev) => ({
      ...prev,
      dietaryPreferences: checked
        ? [...prev.dietaryPreferences, value]
        : prev.dietaryPreferences.filter((pref) => pref !== value),
    }));
  };

  const handleFavoriteFoodChange = (index, event) => {
    const newFavoriteFood = [...preferences.favoriteFoods];
    newFavoriteFood[index] = event.target.value;
    setPreferences((prev) => ({ ...prev, favoriteFoods: newFavoriteFood }));

  };

  const handleAddFavoriteFood = () => {
    const lastFood = preferences.favoriteFoods[preferences.favoriteFoods.length - 1]
    if ( preferences.favoriteFoods.length > 0 && lastFood.trim() === ''){
        alert('Please fill in the current favorite food before adding a new one')
        return;
    }
    if (preferences.favoriteFoods.length <= 10){
        setPreferences((prev) => ({
            ...prev,
            favoriteFoods: [...prev.favoriteFoods, ""],
          }));
    }
    else if(preferences.favoriteFoods.length > 10){
        alert("You've exceeded the maximum length. Please try again.")
    }
  };

  const handleRemoveFavoriteFood = (index) => {
    setPreferences((prev) => ({
      ...prev,
      favoriteFoods: prev.favoriteFoods.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendAddress}/update-preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          cookingLevel: preferences.cookingLevel,
          dietaryPreferences: preferences.dietaryPreferences,
          favoriteFoods: preferences.favoriteFoods,
        }),
        credentials: "include",
      });
      setLoading(false);
      if (response.ok) {
        alert("Preferences updated sucessfully");
        setEdit(false);
      } else {
        const data = await response.json();
        alert("Failed to update preferences");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error during profile setup: ", error);
      alert("Profile Set Up Failed");
    }
  };

  return (
    <div>
      <div>
        <h3>Cooking Level: </h3>
        <p>{preferences.cookingLevel || "Not specified"}</p>
      </div>
      <div>
        <h3>Dietary Preferences: </h3>
        <p>
          {preferences.dietaryPreferences.length
            ? preferences.dietaryPreferences.join(", ")
            : "None specified"}
        </p>
      </div>
      <div>
        <h3>Favorite Foods: </h3>
        <p>
          {preferences.favoriteFoods.length
            ? preferences.favoriteFoods.join(", ")
            : "None specified"}
        </p>
      </div>
      <button onClick={() => setEdit(!edit)}>Edit Preferences</button>
      {edit && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Cooking Level: </label>
            <select
              value={preferences.cookingLevel}
              onChange={(e) =>
                setPreferences({ ...preferences, cookingLevel: e.target.value })
              }
            >
              <option value="">Select your cooking level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced learner">Advanced Learner</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
          <div>
            <label>Dietary Preferences (Optional): </label>
            <div>
                {dietaryLabels.map((label) => (
                    <label key={label}>
                        <input type="checkbox" value={label} checked={preferences.dietaryPreferences.includes(label)} onChange={handleCheckboxChange}/>
                        {label}
                    </label>
                ))}
            </div>
          </div>
          <div>
            <label>Favorite Foods (Optional): </label>
            {preferences.favoriteFoods.map((food, index) => (
              <div key={index}>
                <input
                  type="text"
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
            {preferences.favoriteFoods.length <= 10 && (
                <button type="button" onClick={handleAddFavoriteFood}>
                Add Favorite Food
                </button>
            )}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      )}
    </div>
  );
}

export default DietaryRestrictions;
