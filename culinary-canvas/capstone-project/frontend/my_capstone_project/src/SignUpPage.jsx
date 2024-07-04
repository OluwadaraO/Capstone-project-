import "./SignUpPage.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
function Sign_Up_Page() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUserSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userName, password, name }),
        }
      );
      if (response.ok) {
        navigate("/login");
        alert("Please log in...");
      } else {
        alert(
          "Oops! This username already exists. Please try another username"
        );
      }
    } catch (error) {
      alert("Something went wrong. Please try again...");
    }
  };
  return (
    <div className="Sign-up">
      <div className="header-values">
        <h1> Welcome to Culinary Canvas</h1>
        <div className="Authorization Links">
          <a href="/login">Log In</a>
          <a href="/create"> Sign Up</a>
        </div>
      </div>
      <div className="SignupPage">
        <div className="SignUpFormContainer">
          <h1 className="create-new-account">Sign Up</h1>
          <form onSubmit={handleUserSignUp}>
            <p className="create-name">Please create a username and password</p>
            <div className="user-values">
              <div className="username-with-input">
                <input
                  type="text"
                  className="user-name-answer"
                  placeholder="Create a new username... "
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div className="password-with-input">
                <input
                  type="text"
                  placeholder="Input your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="name-with-input">
                <input
                  type="text"
                  placeholder="Your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p>{error}</p>}
            <button type="submit" className="sign-up">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Sign_Up_Page;
