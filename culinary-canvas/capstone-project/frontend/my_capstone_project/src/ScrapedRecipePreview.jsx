import React, { useState } from "react";

function ScrapedRecipePreview({ data, onSubmit, onReset }) {
  const [editedData, setEditedData] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: name === "ingredients" ? value.split("\n") : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(editedData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Preview and Edit</h2>
      {editedData.image && (
        <img src={editedData.image} alt={editedData.title} />
      )}
      <label>
        Title:
        <input
          type="text"
          name="title"
          value={editedData.title}
          onChange={handleChange}
        />
      </label>
      <label>
        Ingredients:
        <textarea
          name="ingredients"
          value={editedData.ingredients.join("\n")}
          onChange={handleChange}
        />
      </label>
      {editedData.calories !== undefined && (
        <label>
          Calories:
          <input
            name="calories"
            value={editedData.calories}
            onChange={handleChange}
          />
        </label>
      )}
      <button type="submit" onClick={handleSubmit}>
        Submit Recipe
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </form>
  );
}
export default ScrapedRecipePreview;
