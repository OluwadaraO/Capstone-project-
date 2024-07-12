import React, {useState} from "react";
import './MealPlannerModal.css'
function MealPlannerModal({recipe, isOpen, onClose, onAddToPlanner}) {
    const daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const mealTypes = ["Breakfast", "Lunch", "Dinner"]

    const [day, setDay] = useState('');
    const [mealType, setMealType] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddToPlanner(day, mealType, recipe)
    };

    if (!isOpen){
        return null;
    }

    return(
        <div className="modal">
            <div className="modal-content">
                <h2>Add to Meal Planner</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Day: </label>
                        <select value={day} onChange={(e) => setDay(e.target.value)} required>
                            <option value="">Select a day</option>
                            {daysOfTheWeek.map((day, index) => (
                                <option key={index} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Meal Type: </label>
                        <select value={mealType} onChange={(e) => setMealType(e.target.value)} required>
                            <option value="">Select a Meal Type</option>
                            {mealTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Add to Planner</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};
export default MealPlannerModal
