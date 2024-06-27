import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from './RedirectToAuthentication'
import './Log_In_Page.css'
import Header from "./Header";

function Log_In_Page(){
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { isAuthenticated,login} = useAuth();
    const navigate = useNavigate();

    const handleUserLogin = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`,{
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({userName, password})

            });
            if (response.ok){
                const {token, user} = await response.json()
                console.log("value", user)
                login(user)
                navigate('/')
            } else{
                alert('Wrong username or password. Please try again...')
            }
        } catch(err){
            console.error(err)
            alert('Oops! Something went wrong. Please try again.')
        }
    };
    // useEffect(() => {
    //     handleUserLogin(e)
    // }, [])

    return(
        <div className="logInPage">
            <Header/>
            <div className="authorizationLinks">
                <a href="/login"> Log In</a>
                <a href="/create"> Sign Up</a>
            </div>
            <div className="LogInBody">
                <form className="LogInForm" onSubmit={handleUserLogin}>
                    <input
                    type="text"
                    id="userName"
                    placeholder="UserName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)} required/>

                    <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} required/>
                    {error && <p>{error}</p>}
                    <button type="submit" className="submitButton">Log In</button>
                </form>
            </div>
        </div>
    )

}
export default Log_In_Page
