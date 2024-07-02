import './UserProfile.css';
import {  Link } from 'react-router-dom';
import React ,{ useState, useEffect } from 'react';
import { useAuth } from './RedirectToAuthentication'

function UserProfile(){
    const { user, logOut} = useAuth();
    const [savedRecipe, setSavedRecipe] = useState([])


    const fetchSavedRecipes = async() => {
        const response = await fetch(`http://localhost:3000/recipes/save/${user.id}`)
        const data = await response.json();
        setSavedRecipe(data);
    };

    useEffect(() => {
        if(user){
            fetchSavedRecipes()
        }
    }, [user])
    const handleLike = async(recipe) => {
        if (savedRecipe.some(saved => saved.recipeId === recipe.recipe.uri)){
            await fetch('http://localhost:3000/recipes/unsaved', {
                method: 'DELETE',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({
                    userId: user.id,
                    recipeId: recipe.recipe.uri,
                })
            });
            setSavedRecipe(savedRecipe.filter(saved => saved.recipeId !== recipe.recipe.uri))

        }else{
            const response = await fetch(`http://localhost:3000/recipes/saved`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    userId: user.id,
                    recipeId: recipe.recipe.uri,
                    recipeName: recipe.recipe.label,
                    recipeImage: recipe.recipe.image
                })
            });
            const savedRecipe = await response.json()
            setSavedRecipe([...savedRecipe, savedRecipe])
        }
    };

    const handleLogOut =  async() => {
        try{
            await logOut();
            alert('Logged out Successfully');
        }catch(error){
            console.error(error)
        }
    }

    if(!user){
        return (
            <Link to="/login">Please log back in</Link>
        )
    }

    return(
        <div className='dashboard'>
            <div className='profile-section'>
                <img src={user.imageUrl} alt={`${user.name}'s profile`} className='profile-picture'/>
                <h1>Welcome back {user.name}</h1>
            </div>
            <div className='saved-recipes-section'>
                <h3>Saved Recipes</h3>
                <div className='recipes-grid'>
                    {savedRecipe.length === 0 ? (
                        <p>No saved recipes found</p>
                    ) : (
                        savedRecipe.map(recipe => (
                            <div key={recipe.recipeId} className='recipe-card'>
                                <img src={recipe.recipeImage} alt={recipe.recipeName} />
                                <h4>{recipe.recipeName}</h4>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Link to="/"><button>Back to Home Page</button></Link>
            <button onClick={handleLogOut}>Log Out</button>
        </div>
    )
}
export default UserProfile;
