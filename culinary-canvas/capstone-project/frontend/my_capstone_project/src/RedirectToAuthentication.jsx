import React, {createContext, useContext, useEffect, useState} from 'react'

const RedirectToAuthentication = createContext()
export const  AuthorizationContext = ({children})=>{
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const checkAuthorization = async() => {
            try{
                const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/protected`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if(response.ok){
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUser(data);
                }
                else{
                    setIsAuthenticated(false);
                    setUser(null)
                }
            }catch(error) {
                console.error('Oops! Wrong Log in credentials');
                setIsAuthenticated(false);
                setUser(null)
            }
        };
        checkAuthorization();
    }, []);

    const login=(userData)=>{
        setIsAuthenticated(true);
        setUser(userData);
    };

    const  logOut = async()=>{
        try{
            await fetch('http://localhost:3000/logout', {
                method: "POST",
                credentials: 'include',
            });
            setIsAuthenticated(false);
            setUser(null);
        }catch(error){
            console.error(error)
        }
    };

    return(
        <RedirectToAuthentication.Provider value={{isAuthenticated, user, logOut, login}}>
            {children}
        </RedirectToAuthentication.Provider>
    );
};
export const useAuth = () => {
    return useContext(RedirectToAuthentication);
};
