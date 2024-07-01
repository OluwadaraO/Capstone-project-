import {  Link } from 'react-router-dom';
import './UserProfile.css';
import { useAuth } from './RedirectToAuthentication'
function UserProfile(){
    const { isAuthenticated, user, logOut} = useAuth();
    return(
        <>
            <h1>Welcome back {user.name}</h1>
            <Link to="/"><button>Back to Home Page</button></Link>
        </>
    )
}
export default UserProfile;
