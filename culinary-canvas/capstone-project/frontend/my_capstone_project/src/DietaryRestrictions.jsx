import React, { useState, useEffect } from "react";
import { useAuth } from "./RedirectToAuthentication";
function DietaryRestrictions() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    cookingLevel: "",
    dietaryPreferences: [],
    favoriteFoods: [],
  });
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
            dietaryPreferences: data.dietaryRestrictions || [],
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
    setPreferences((prev) => ({
      ...prev,
      favoriteFoods: [...prev.favoriteFoods, ""],
    }));
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
              required
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
              <label>
                <input
                  type="checkbox"
                  value="Gluten-free"
                  checked={preferences.dietaryPreferences.includes(
                    "Gluten-free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Gluten-free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Sugar-Conscious"
                  checked={preferences.dietaryPreferences.includes(
                    "Sugar-Conscious"
                  )}
                  onChange={handleCheckboxChange}
                />
                Sugar-Conscious
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Kidney-Friendly"
                  checked={preferences.dietaryPreferences.includes(
                    "Kidney-Friendly"
                  )}
                  onChange={handleCheckboxChange}
                />
                Kidney-Friendly
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Egg-Free"
                  checked={preferences.dietaryPreferences.includes("Egg-Free")}
                  onChange={handleCheckboxChange}
                />
                Egg-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Peanut-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Peanut-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Peanut-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Tree-Nut-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Tree-Nut-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Tree-Nut-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Soy-Free"
                  checked={preferences.dietaryPreferences.includes("Soy-Free")}
                  onChange={handleCheckboxChange}
                />
                Soy-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Fish-Free"
                  checked={preferences.dietaryPreferences.includes("Fish-Free")}
                  onChange={handleCheckboxChange}
                />
                Fish-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Shellfish-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Shellfish-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Shellfish-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Pork-Free"
                  checked={preferences.dietaryPreferences.includes("Pork-Free")}
                  onChange={handleCheckboxChange}
                />
                Pork-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Red-Meat-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Red-Meat-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Red-Meat-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Crustacean-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Crustacean-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Crustacean-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Celery-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Celery-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Celery-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Mustard-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Mustard-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Mustard-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Sesame-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Sesame-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Sesame-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Lupine-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Lupine-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Lupine-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Mollusk-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Mollusk-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Mollusk-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Alcohol-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Alcohol-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Alcohol-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Sulfite-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Sulfite-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Sulfite-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Vegetarian"
                  checked={preferences.dietaryPreferences.includes(
                    "Vegetarian"
                  )}
                  onChange={handleCheckboxChange}
                />
                Vegetarian
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Pescatarian"
                  checked={preferences.dietaryPreferences.includes(
                    "Pescatarian"
                  )}
                  onChange={handleCheckboxChange}
                />
                Pescatarian
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Wheat-Free"
                  checked={preferences.dietaryPreferences.includes(
                    "Wheat-Free"
                  )}
                  onChange={handleCheckboxChange}
                />
                Wheat-Free
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Kosher"
                  checked={preferences.dietaryPreferences.includes("Kosher")}
                  onChange={handleCheckboxChange}
                />
                Kosher
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Immuno-Supportive"
                  checked={preferences.dietaryPreferences.includes(
                    "Immuno-Supportive"
                  )}
                  onChange={handleCheckboxChange}
                />
                Immuno-Supportive
              </label>
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
            <button type="button" onClick={handleAddFavoriteFood}>
              Add Favorite Food
            </button>
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
