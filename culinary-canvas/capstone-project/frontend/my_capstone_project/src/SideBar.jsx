import React, {useState} from "react";
import {  Link } from 'react-router-dom';
import { useAuth } from './RedirectToAuthentication'
import './SideBar.css';
function SideBar(){
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, logOut} = useAuth();
    const toggleSideBar = () => {
        setIsOpen(!isOpen)
    };
    return(
        <div className={`sidebar ${isOpen? 'open' : ''}`}>
            <button className="sidebar-toggle" onClick={toggleSideBar}>
                {isOpen ? 'Close' : 'Menu'}
            </button>
            <div className="sidebar-content">
                <ul>
                    {/* <h3>Hi {user.name}</h3> */}
                    <button>Log Out</button>
                </ul>
            </div>
        </div>
    )
}
export default SideBar;
