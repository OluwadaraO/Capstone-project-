import './HomePage.css'
import Header from './Header'
import Banner from './Banner'
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from './RedirectToAuthentication'
function HomePage(){
    const navigate = useNavigate();
    const { isAuthenticated, username, logOut} = useAuth();
    const LogOut = async() =>{
        try{
            logOut()
            alert('Logged Out Successfully')
            navigate('/')
        } catch(error){
            console.log(error)
        }
    }
    return (
        <>
            <Header/>
            {isAuthenticated && username &&(
                <div>
                    <p>Hi @{username.name}</p>
                </div>
            )}
            <button id='LogOutButton' onClick={LogOut}>Log Out</button>
            <Banner/>
        </>
    )
}
export default HomePage
