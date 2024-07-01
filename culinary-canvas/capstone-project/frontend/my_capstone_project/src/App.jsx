import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './HomePage'
import Sign_Up_Page from './Sign_Up_Page'
import Log_In_Page from './Log_In_Page'
import UserProfile from './UserProfile'
import {AuthorizationContext} from './RedirectToAuthentication'
function App() {
  return (
     <AuthorizationContext>
        <Router>
            <Routes>
              <Route path="/" element={<HomePage />}/>
              <Route path='/login' element={<Log_In_Page/>}/>
              <Route path='/create' element={<Sign_Up_Page />}/>
              <Route path='/login/:id' element={<UserProfile/>}/>
            </Routes>
        </Router>
      </AuthorizationContext>
  )
}

export default App
