import './HomePage.css'
import React from 'react';
import Header from './Header';
import Banner from './Banner';
import { useNavigate } from "react-router-dom";
import { useAuth } from './RedirectToAuthentication'
function HomePage(){
    const navigate = useNavigate();
    const { isAuthenticated, user, logOut} = useAuth();
    
    const LogOut = async() =>{
        try{
            await logOut();
            alert('Logged Out Successfully');
            navigate('/');
        } catch(error){
            console.log(error)
        }
    }
    console.log("HomePage Render", { isAuthenticated, user })
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
        </>
    )
}
export default HomePage
