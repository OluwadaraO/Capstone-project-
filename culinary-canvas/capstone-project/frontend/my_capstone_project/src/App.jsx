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
        </Routes>
      </Router>
    </AuthorizationContext>
  );
}

export default App;
