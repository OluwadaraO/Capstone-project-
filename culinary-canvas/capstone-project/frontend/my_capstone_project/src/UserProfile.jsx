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

const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
function UserProfile() {
  const [healthScores, setHealthScores] = useState([]);
  const { isAuthenticated, user, logOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(()=> {
    const socket = getSocket();
    if (isAuthenticated && user){
      const fetchHealthScores = async() => {
        try{
          const response = await fetch(`${backendAddress}/meal-planner-health-scores`, {
            credentials: 'include',
          });
          if (response.status === 429){
            setRateLimitModalOpen(true);
            setTimeout(() => setRateLimitModalOpen(false), 120000)
          }
          else{
            const data = await response.json();
            setHealthScores(data)
          }
        }catch(error){
          console.error('Error fetching health scores: ', error)
        }
      };
      fetchHealthScores();
      socket.on('connect', () => {
        socket.emit('suscribe', user)
    });

      socket.on('healthScoresUpdated', (updatedHealthScores) => {
        setHealthScores(updatedHealthScores)
      });
      socket.on('disconnect', () => {
          console.log('Disconnected from web socket server')
      })
      socket.on('connect_error', (error) => {
          console.error('Connection error: ', error)
      })
      socket.on('reconnect_attempt', () => {
          console.log('Attempting to reconnect...')
      })
      return () => {
        socket.off('connect');
        socket.off('healthScoresUpdated');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('reconnect_attempt');
      };

    }
  }, [isAuthenticated, user])
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
        <div className="chart-container">
          <BarChart healthScores={healthScores}/>
        </div>
        <RateLimitModal isOpen={isRateLimitModalOpen} onClose={() => setRateLimitModalOpen(false)}/>
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
