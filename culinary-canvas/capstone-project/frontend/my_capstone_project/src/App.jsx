import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './HomePage'
import Sign_Up_Page from './Sign_Up_Page'
import Log_In_Page from './Log_In_Page'
import {AuthorizationContext} from './RedirectToAuthentication'
function App() {
  return (
    <>
      <Router>
          <AuthorizationContext>
            <Routes>
              <Route path='/login' element={<Log_In_Page/>}/>
              <Route path="/" element={<HomePage />}/>
              <Route path='/create' element={<Sign_Up_Page />}/>
            </Routes>
          </AuthorizationContext>

      </Router>
    </>
  )
}

export default App
