import './Sign_Up_Page.css'
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
function Sign_Up_Page() {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    const handleUserSignUp = async(e) => {
        e.preventDefault();
        try{
            const response = await fetch (`${import.meta.env.VITE_BACKEND_ADDRESS}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({userName, password, name})
            });
            if (response.ok){
                navigate('/login');
                alert('Please log in...')
            }
            else{
                alert('Oops! This username already exists. Please try another username')
            }
        } catch(error){
            alert('Something went wrong. Please try again...')
        }
    }
    return(
        <div className='Sign-up'>
            <h1> Welcome to Culinary Canvas</h1>
            <div className='Authorization Links'>
                <a href='/login'>Log In</a>
                <a href='/create'> Sign Up</a>
            </div>

            <form onSubmit={handleUserSignUp}>
                <p>Please create a username and password...</p>
                <label>Username: </label>
                    <input type='text'
                    placeholder='Create a new username... '
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}/>
                <label>Password: </label>
                <input type='text'
                placeholder='Input your password...'
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
                <label> Name: </label>
                <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}/>
                {error && <p>{error}</p>}
                <button type='submit'>Sign Up</button>
            </form>

        </div>
    )
}
export default Sign_Up_Page
