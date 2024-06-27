import React, {createContext, useContext, useEffect, useState} from 'react'

const RedirectToAuthentication = createContext()
export const  AuthorizationContext = ({children})=>{
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [username, setUserName] = useState(null)

    useEffect(() => {
        const checkAuthorization = async() => {
            try{
                const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/protected`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if(response.ok){
                    const data = await response.json();
                    console.log(data)
                    setUserName(data)
                    setIsAuthenticated(true);

                }
                else{
                    setIsAuthenticated(false)
                }
            }catch(error) {
                console.error('Oops! Wrong Log in credentials')
                setIsAuthenticated(false)
            }
        }; checkAuthorization();
    }, [])
    function login(userData){
        setIsAuthenticated(true)
        setUserName(userData)
    }
    const  logOut = async()=>{
        try{
            await fetch('http://localhost:3000/logout', {
                method: "POST",
                credentials: 'include'
            });
            setIsAuthenticated(false)
            setUserName(null)
        }catch(error){
            console.error('Log out Failed')
        }
    }

    return(
        <RedirectToAuthentication.Provider value={{isAuthenticated, username, logOut, login}}>
            {children}
        </RedirectToAuthentication.Provider>
    )
}
export const useAuth = () => {
    return useContext(RedirectToAuthentication)
}
