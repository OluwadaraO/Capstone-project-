import React, { useState } from "react";
import "./ImportRecipeButton.css";
const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
import { useAuth } from "./RedirectToAuthentication";
import ScrapedRecipePreview from "./ScrapedRecipePreview";
function ImportRecipeButton({ onClose, onRecipeAdded }) {
  const [importedRecipe, setImportedRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleSubmit = async (finalData) => {
    try {
      const response = await fetch(
        `${backendAddress}/scraped-recipes/${finalData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        alert(`${data.title} has been added successfully`);
        onRecipeAdded(data);
        onClose();
      } else {
        throw new Error(response.error || "Failed to update recipe");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleImport = async (url) => {
    if (user) {
      try {
        const response = await fetch(`${backendAddress}/scrape-recipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id, url }),
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
          alert(data.error);
          throw new Error(data.error || "Failed to import recipe");
        } else if (response.ok) {
          setImportedRecipe(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Oops! You're not authorized");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Import Recipe</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        {!importedRecipe ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleImport(e.target.url.value);
            }}
          >
            <div className="form-group">
              <label htmlFor="recipe-url">Recipe URL</label>
              <input
                id="recipe-url"
                type="url"
                name="url"
                required
                placeholder="Enter recipe URL"
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Scraping..." : "Scrape Recipe"}
              </button>
            </div>
          </form>
        ) : (
          <ScrapedRecipePreview
            data={importedRecipe}
            onSubmit={handleSubmit}
            onReset={() => setImportedRecipe(null)}
          />
        )}
      </div>
    </div>
  );
}
export default ImportRecipeButton;
