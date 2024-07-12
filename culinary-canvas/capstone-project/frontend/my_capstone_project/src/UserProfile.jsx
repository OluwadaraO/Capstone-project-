import "./UserProfile.css";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./RedirectToAuthentication";
import GroceryList from "./GroceryList";
import SavedRecipes from "./SavedRecipes";
import ProfilePictureModal from "./ProfilePictureModal";
import DietaryRestrictions from "./DietaryRestrictions";
import MealPlannerDashboard from "./MealPlannerDashboard";

function UserProfile() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("userId", user.id);
    try {
      const response = await fetch(`${backendAddress}/upload-profile-picture`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        user.imageUrl = data.imageUrl;
        closeModal();
      } else {
        console.error("Failed to upload profile picture: ", data.error);
      }
    } catch (error) {
      console.error("Error uploading profile picture: ", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="profile-section">
        <img
          src={user.imageUrl}
          alt={`${user.name}'s profile`}
          className="profile-picture"
          onClick={openModal}
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
        <DietaryRestrictions />
      </div>
      <div className="recommended-recipes">
        <h2>Weekly Meal Planner</h2>
        <MealPlannerDashboard/>
      </div>
      <ProfilePictureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpload={handleUpload}
      />
    </div>
  );
}
export default UserProfile;
