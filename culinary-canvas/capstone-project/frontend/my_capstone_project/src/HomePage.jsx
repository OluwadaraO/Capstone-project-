import './HomePage.css'
import React, {useEffect, useRef, useState} from 'react';
import Header from './Header';
import Banner from './Banner';
import { useNavigate } from "react-router-dom";
import { useAuth } from './RedirectToAuthentication'
import LoadingSpinner from './LoadingSpinner';
import { Link } from 'react-router-dom';
function HomePage(){
    const navigate = useNavigate();
    const { isAuthenticated, user, logOut} = useAuth();
    //state to store recipies for each query
    const [recipes, setRecipes] = useState({})
    //array of queries to fetch different categories of recipies
    const queries = ['chicken', 'beef', 'fish', 'rice', 'cookies', 'cheese', 'salad']
    //state to manage loading
    const [isLoading, setIsLoading] = useState(true)

    //function to log out
    const LogOut = async() =>{
        try{
            await logOut();
            alert('Logged Out Successfully');
            navigate('/');
        } catch(error){
            console.log(error)
        }
    }

    //if a user that isn't logged in clicks on a button take them to log out page
    function handleHomePageClick(){
        if (!isAuthenticated) {
            navigate('/login')
        }
    }

    //function to fetch recipies for a given query from Edamam API
    const fetchRecipies = async(query) => {
        const appID = import.meta.env.VITE_EDAMAM_APP_ID;
        const appKey = import.meta.env.VITE_EDAMAM_APP_KEY;
        const url = `https://api.edamam.com/search?q=${query}&app_id=${appID}&app_key=${appKey}`;
            try{
                const response = await fetch(url);
                const data = await response.json();
                //return the recipies
                return data.hits;
            }catch(error){
                console.error('Error fetching recipies: ', error);
                return []
            }
        };
    useEffect(()=> {
        const fetchAllRecipes = async() => {
            //stores recipies for all queries
            const allRecipes = {};
            for (let query of queries){
                const recipes = await fetchRecipies(query);
                allRecipes[query] = recipes;
            }
            setRecipes(allRecipes)
            setIsLoading(false);
        };
        fetchAllRecipes();
    }, [])

    const handleRecipeCardClick = (e) => {
        const card = e.target.value;
        card.classList.toggle('active')
    }
    if (isLoading){
        return <LoadingSpinner/>
    }

    return (
        <>
            <Header/>
            {isAuthenticated && user ?(
                <div>
                    <div className='user-information'>
                        <img className="profile-picture" src={user.imageUrl} alt={`${user.name}'s profile picture`}/>
                        <p>Hi @{user.name}</p>
                        <button id='LogOutButton' onClick={LogOut}>Log Out</button>
                    </div>
                </div>
            ) :(<div className='user-authentication'>
                    <button className='user-log-in'><Link to={"/login"}>Log In</Link></button>
                    <button className='user-sign-up'><Link to={"/create"}>Sign Up</Link></button>
                </div>
            )}
            <Banner/>
            <div className='homepage-recipes'>
                {/* loop through each query to create a section for each category */}
                {queries.map((query) => (
                    <div key={query} className='recipe-section'>
                        <h2>Recommended {query.charAt(0).toUpperCase() + query.slice(1)} Recipes</h2>
                        <div className='recipe-scroll'>
                            {recipes[query] && recipes[query].map((recipeData, index) => (
                                <div key={index} className='recipe-card' onClick={handleRecipeCardClick}>
                                    <img src={recipeData.recipe.image} alt={recipeData.recipe.label} onClick={handleHomePageClick}/>
                                    <h3 onClick={handleHomePageClick}>{recipeData.recipe.label} </h3>
                                    <p onClick={handleHomePageClick}>Calories: {Math.round(recipeData.recipe.calories)}</p>
                                    <a href={recipeData.recipe.url} target='_blank' rel='noopener noreferrer' onClick={handleHomePageClick}>View Recipe</a>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </>
    )
}
export default HomePage
