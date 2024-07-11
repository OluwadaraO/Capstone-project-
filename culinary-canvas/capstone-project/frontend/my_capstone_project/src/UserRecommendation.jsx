import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './RedirectToAuthentication';
import LoadingSpinner from './LoadingSpinner';

function UserRecommendation(){
    const navigate = useNavigate();
    const {user, login} = useAuth();
    const [cookingLevel, setCookingLevel] = useState('');
    const [dietaryPreferences, setDietaryPreferences] = useState([]);
    const [favoriteFoods, setFavoriteFoods] = useState('');
    const [loading, setLoading] = useState(false)
    const backendAddress =import.meta.env.VITE_BACKEND_ADDRESS

    const handleCheckboxChange = (event) => {
        const {value, checked} = event.target;
        setDietaryPreferences((prev) => checked ? [...prev, value] : prev.filter((pref) => pref !== value))
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setLoading(true)
        if(user){
            try{
                const response =  await fetch(`${backendAddress}/save-preferences`, {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        cookingLevel,
                        dietaryPreferences,
                        favoriteFoods: favoriteFoods.split(',').map(food => food.trim()).filter(food => food !== '')}),
                    credentials: 'include',
                });
                const data = await response.json()
                console.log(data)
                if(response.ok){
                    alert('Preferences saved successfully. Please log in now');
                    navigate('/login');
                }else{
                    alert('Profile Set Up Failed')
                }
            }catch(error){
                console.error('Error during profile setup: ', error)
                alert('Profile Set Up Failed')
            }finally{
                setLoading(false)
            }
        }else{
            alert('User is not authenticated');
            setLoading(false)
        }

    }

    return(
        <form onSubmit={handleSubmit}>
            <h2>Profile SetUp</h2>
            <div>
                <label>Cooking Level: </label>
                <select value={cookingLevel} onChange={(e) => setCookingLevel(e.target.value)} required>
                    <option value="">Select your cooking level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced learner">Advanced Learner</option>
                    <option value="Professional">Professional</option>
                </select>
            </div>
            <div>
                <label>Dietary Preferences (Optional): </label>
                <div>
                    <label><input type='checkbox' value="Gluten-free" onChange={handleCheckboxChange}/>Gluten-free</label>
                    <label><input type='checkbox' value="Sugar-Conscious" onChange={handleCheckboxChange}/>Sugar-Conscious</label>
                    <label><input type='checkbox' value="Kidney-Friendly" onChange={handleCheckboxChange}/>Kidney-Friendly</label>
                    <label><input type='checkbox' value="Egg-Free" onChange={handleCheckboxChange}/>Egg-Free</label>
                    <label><input type='checkbox' value="Peanut-Free" onChange={handleCheckboxChange}/>Peanut-Free</label>
                    <label><input type='checkbox' value="Tree-Nut-Free" onChange={handleCheckboxChange}/>Tree-Nut-Free</label>
                    <label><input type='checkbox' value="Soy-Free" onChange={handleCheckboxChange}/>Soy-Free</label>
                    <label><input type='checkbox' value="Fish-Free" onChange={handleCheckboxChange}/>Fish-Free</label>
                    <label><input type='checkbox' value="Shellfish-Free" onChange={handleCheckboxChange}/>Shellfish-Free</label>
                    <label><input type='checkbox' value="Pork-Free" onChange={handleCheckboxChange}/>Pork-Free</label>
                    <label><input type='checkbox' value="Red-Meat-Free" onChange={handleCheckboxChange}/>Red-Meat-Free</label>
                    <label><input type='checkbox' value="Crustacean-Free" onChange={handleCheckboxChange}/>Crustacean-Free</label>
                    <label><input type='checkbox' value="Celery-Free" onChange={handleCheckboxChange}/>Celery-Free</label>
                    <label><input type='checkbox' value="Mustard-Free" onChange={handleCheckboxChange}/>Mustard-Free</label>
                    <label><input type='checkbox' value="Sesame-Free" onChange={handleCheckboxChange}/>Sesame-Free</label>
                    <label><input type='checkbox' value="Lupine-Free" onChange={handleCheckboxChange}/>Lupine-Free</label>
                    <label><input type='checkbox' value="Mollusk-Free" onChange={handleCheckboxChange}/>Mollusk-Free</label>
                    <label><input type='checkbox' value="Alcohol-Free" onChange={handleCheckboxChange}/>Alcohol-Free</label>
                    <label><input type='checkbox' value="Sulfite-Free" onChange={handleCheckboxChange}/>Sulfite-Free</label>
                    <label><input type='checkbox' value="Vegetarian" onChange={handleCheckboxChange}/>Vegetarian</label>
                    <label><input type='checkbox' value="Pescatarian" onChange={handleCheckboxChange}/>Pescatarian</label>
                    <label><input type='checkbox' value="Wheat-Free" onChange={handleCheckboxChange}/>Wheat-Free</label>
                    <label><input type='checkbox' value="Kosher" onChange={handleCheckboxChange}/>Kosher</label>
                    <label><input type='checkbox' value="Immuno-Supportive" onChange={handleCheckboxChange}/>Immuno-Supportive</label>
                </div>
            </div>
            <div>
                <label>Favorite Foods (Optional): </label>
                <input type='text' placeholder='Enter your favorite foods separated by commas' value={favoriteFoods} onChange={(e) => setFavoriteFoods(e.target.value)}/>
            </div>
            <button type='submit' disabled={loading}>{loading?'Saving...' : 'Save Preferences'}</button>
            {loading && <LoadingSpinner/>}
        </form>
    )

}
export default UserRecommendation
