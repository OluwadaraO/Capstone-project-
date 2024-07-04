import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./RedirectToAuthentication";
import "./LogInPage.css";
import Header from "./Header";

function Log_In_Page() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleUserLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userName, password }),
        }
      );
      if (response.ok) {
        const user = await response.json();
        login(user.userRecord);
        navigate("/");
      } else {
        alert("Wrong username or password. Please try again...");
      }
    } catch (err) {
      console.error(err);
      alert("Oops! Something went wrong. Please try again.");
    }
  };

  return (
    <div className="logInPage">
      <div className="culinary-canvas">
        <h1 className="title">Culinary Canvas</h1>
      </div>
      <div className="loginPage">
        <div className="LoginFormContainer">
          <h1 className="sign-in">Sign In</h1>
          <form className="LoginForm" onSubmit={handleUserLogin}>
            <input
              type="text"
              id="userName"
              placeholder="UserName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="given-name"
              required
            />

            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="submitButton">
              Log In
            </button>
            <p className="sign-up-link">
              Don't have an account? <a href="/create">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Log_In_Page;
