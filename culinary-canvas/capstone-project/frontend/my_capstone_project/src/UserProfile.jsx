import "./UserProfile.css";
import { Link } from "react-router-dom";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./RedirectToAuthentication";
import GroceryList from "./GroceryList";
import SavedRecipes from "./SavedRecipes";

function UserProfile() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const handleLogOut = async () => {
    try {
      await logOut();
      alert("Logged out Successfully");
    } catch (error) {
      console.error(error);
    }
  };
  if (!user) {
    return <Link to="/login">Please log back in</Link>;
  }

  const handleFindRecipe = () => {
    navigate("/find-recipes");
  };

  return (
    <div className="dashboard-container">
      <div className="profile-section">
        <img
          src={user.imageUrl}
          alt={`${user.name}'s profile`}
          className="profile-picture"
        />
        <h1>Welcome back {user.name}</h1>
        <button onClick={handleFindRecipe}>
          Find Recipes with Ingredients
        </button>
        <Link to="/">
          <button>Back to Home Page</button>
        </Link>
        <button onClick={handleLogOut}>Log Out</button>
      </div>
      <div className="saved-recipes">
        <h2>Saved Recipes</h2>
        <SavedRecipes />
      </div>
      <div className="grocery-list">
        <h2>Grocery List</h2>
        <GroceryList />
      </div>
      <div className="dietary-restrictions">
        <h2>Dietary Restrictions</h2>
      </div>
      <div className="recommended-recipes">
        <h2>Recommended Recipes</h2>
      </div>
    </div>
  );
}
export default UserProfile;
