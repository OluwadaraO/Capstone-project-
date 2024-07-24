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
import BarChart from "./BarChart";
import { getSocket } from "./socket";
import RateLimitModal from "./RateLimitModal";
import ImportRecipeButton from "./ImportRecipeButton";

const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
function UserProfile() {
  const [healthScores, setHealthScores] = useState([]);
  const { isAuthenticated, user, logOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfilepictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const [isRateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (isAuthenticated && user) {
      const fetchHealthScores = async () => {
        try {
          const response = await fetch(
            `${backendAddress}/meal-planner-health-scores`,
            {
              credentials: "include",
            }
          );
          if (response.status === 429) {
            setRateLimitModalOpen(true);
            setTimeout(() => setRateLimitModalOpen(false), 120000);
          } else {
            const data = await response.json();
            setHealthScores(data);
          }
        } catch (error) {
          console.error("Error fetching health scores: ", error);
        }
      };
      fetchHealthScores();
      socket.on("connect", () => {
        socket.emit("suscribe", user);
      });

      socket.on("healthScoresUpdated", (updatedHealthScores) => {
        setHealthScores(updatedHealthScores);
      });
      socket.on("disconnect", () => {
        console.log("Disconnected from web socket server");
      });
      socket.on("connect_error", (error) => {
        console.error("Connection error: ", error);
      });
      socket.on("reconnect_attempt", () => {
        console.log("Attempting to reconnect...");
      });
      return () => {
        socket.off("connect");
        socket.off("healthScoresUpdated");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("reconnect_attempt");
      };
    }
  }, [isAuthenticated, user]);
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

  const openProfilePictureModal = () => {
    setIsProfilePictureModalOpen(true);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeProfilePictureModal = () => {
    setIsProfilePictureModalOpen(false);
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
        closeProfilePictureModal();
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
          onClick={openProfilePictureModal}
        />
        <h1>Welcome back {user.name}</h1>
        <button onClick={handleFindRecipe}>
          Find Recipes with Ingredients
        </button>
        <Link to="/">
          <button>Back to Home Page</button>
        </Link>
        <button onClick={handleLogOut}>Log Out</button>
        <button
          onClick={openModal}
          title="Want to keep other recipes here? Submit the link to that website!"
        >
          Import Recipe Url
        </button>
        <Link to="/imported-recipes">
          <button>View All Your Imported Recipes</button>
        </Link>
        <Link to="/notifications">
          <img src="../bell.png" alt="Notifications bell" />
        </Link>
        <div className="chart-container">
          <BarChart healthScores={healthScores} />
        </div>
        <RateLimitModal
          isOpen={isRateLimitModalOpen}
          onClose={() => setRateLimitModalOpen(false)}
        />
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
        <MealPlannerDashboard />
      </div>
      <ProfilePictureModal
        isOpen={isProfilepictureModalOpen}
        onClose={closeProfilePictureModal}
        onUpload={handleUpload}
      />
      {isModalOpen && <ImportRecipeButton onClose={closeModal} />}
    </div>
  );
}
export default UserProfile;
