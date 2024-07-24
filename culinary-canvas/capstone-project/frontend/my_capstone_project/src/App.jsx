import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage";
import SignUpPage from "./SignUpPage";
import LogInPage from "./LogInPage";
import UserProfile from "./UserProfile";
import { AuthorizationContext } from "./RedirectToAuthentication";
import FindRecipes from "./FindRecipes";
import UserRecommendation from "./UserRecommendation";
import Notification from "./Notification";
import ScrapedRecipes from "./ScrapedRecipes";
function App() {
  return (
    <AuthorizationContext>
      <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/create" element={<SignUpPage />} />
            <Route path="/login/:id" element={<UserProfile />} />
            <Route path="/find-recipes" element={<FindRecipes />} />
            <Route path="/preferences" element={<UserRecommendation/>}/>
            <Route path="/notifications" element={<Notification/>}/>
            <Route path="/imported-recipes" element={<ScrapedRecipes/>}/>
          </Routes>
      </Router>
    </AuthorizationContext>
  );
}

export default App;
