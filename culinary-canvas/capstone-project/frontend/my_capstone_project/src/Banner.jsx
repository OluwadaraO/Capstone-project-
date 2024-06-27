import './Banner.css'
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from './RedirectToAuthentication'
function Banner(){
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();

    function handleHomePageClick(){
        if (!isAuthenticated) {
            navigate('/login')
        }
    }
    return(
        <div>
            <div className='search'>
                <input type='text' placeholder='Search for...' className='search-bar'/>
                <button id='search-button' onClick={handleHomePageClick}>SEARCH</button>
            </div>
            <div>
                <button onClick={handleHomePageClick}>All</button>
                <button onClick={handleHomePageClick}>Popularity</button>
                <button onClick={handleHomePageClick}>Cuisines</button>
                <button onClick={handleHomePageClick}>Calory</button>
            </div>
        </div>
    )
}
export default Banner
