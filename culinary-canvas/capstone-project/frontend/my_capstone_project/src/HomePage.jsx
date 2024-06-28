import './HomePage.css'
import React, {useEffect, useState} from 'react';
import Header from './Header';
import Banner from './Banner';
import { useNavigate } from "react-router-dom";
import { useAuth } from './RedirectToAuthentication'
function HomePage(){
    const navigate = useNavigate();
    const { isAuthenticated, user, logOut} = useAuth();
    const [recipes, setRecipes] = useState([])

    const LogOut = async() =>{
        try{
            await logOut();
            alert('Logged Out Successfully');
            navigate('/');
        } catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        const fetchRecipies = async() => {
            try{
                const response = await fetch(`https://api.edamam.com/search?q=beans&app_id=${import.meta.env.VITE_EDAMAM_APP_ID}&app_key=${import.meta.env.VITE_EDAMAM_APP_KEY}`)
                if(!response.ok){
                    throw new Error("Error fetching recipes")
                }
                const data = await response.json();
                setRecipes(data.hits.map(hit => hit.recipe));
            }catch(error){
                console.error('Error fetching recipies: ', error)
            }
        }; fetchRecipies();
    }, [])
    return (
        <>
            <Header/>
            {isAuthenticated && user ?(
                <div>
                    <div className='user-information'>
                        <img className="profile-picture" src={user.imageUrl} alt={`${user.name}'s profile picture`}/>
                        <p>Hi @{user.name}</p>
                    </div>
                    <button id='LogOutButton' onClick={LogOut}>Log Out</button>
                </div>
            ) :(<>
                    <a href='/login'>Log In</a>
                    <a href='/create'>Sign Up</a>
                </>
            )}
            <Banner/>
            <h1>Beans</h1>
            <div className='recipes'>
                {recipes.map((recipe, index) => (
                    <div key={index} className='recipe'>
                        <h3>{recipe.label}</h3>
                        <img src={recipe.image} alt={recipe.label}/>
                        <p>{recipe.ingredientLines.join(' , ')}</p>
                    </div>
                ))}
            </div>
            
        </>
    )
}
export default HomePage
