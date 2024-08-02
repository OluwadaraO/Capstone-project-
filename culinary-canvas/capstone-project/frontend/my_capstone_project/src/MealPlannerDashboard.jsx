import React, { useEffect, useState } from 'react';
import { useAuth } from './RedirectToAuthentication';

function MealPlannerDashboard() {
  const { user } = useAuth();
  const [mealPlanner, setMealPlanner] = useState([]);
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    if (user) {
      const fetchMealPlanner = async () => {
        try {
          const response = await fetch(`${backendAddress}/meal-planner/${user.id}`);
          const data = await response.json();
          setMealPlanner(data);
        } catch (error) {
          console.error('Error fetching meal planner: ', error);
        }
      };
      fetchMealPlanner();
    }
  }, [user, backendAddress]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${backendAddress}/meal-planner/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setMealPlanner(mealPlanner.filter((plan) => plan.id !== id));
      } else {
        console.error('Failed to delete meal plan');
      }
    } catch (error) {
      console.error('Error deleting meal plan: ', error);
    }
  };

  return (
    <div className="meal-planner-dashboard">
      {mealPlanner.length > 0 ? (
        mealPlanner.map((plan, index) => (
          <div key={index} className="meal-card">
            <h4>
              {plan.day} - {plan.mealType}
            </h4>
            <img src={plan.recipeImage} alt={plan.recipeName} className='recipe-image-weekly'/>
            <h4 className="recipe-name">{plan.recipeName}</h4>
            <img
              src="../trash-solid.svg"
              onClick={() => handleDelete(plan.id)}
              alt="delete recipe"
              className="delete-can-weekly"
            />
            <a href={plan.recipeUrl} target="_blank" rel="noopener noreferrer">
              <button className="view-recipe">View Recipe</button>
            </a>
          </div>
        ))
      ) : (
        <p>
          No meal plans yet. Add some recipes to your planner by clicking on the plus sign of that
          recipe!
        </p>
      )}
    </div>
  );
}
export default MealPlannerDashboard;
