"use client";

import { useState } from "react";
import "./login.css";
import "./login.css";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
// import { FaArrowLeftLong } from "react-icons/fa6";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { userPool } from "@/app/aws-config";

function Login({ onBackToHome, onLoginSuccess, onSignupClick }) {
function Login({ onBackToHome, onLoginSuccess, onSignupClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log("Login successful:", result);
          onLoginSuccess({
            email,
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
          });
        },
        onFailure: (err) => {
          console.error("Login failed:", err);
          setError(err.message || "Invalid email or password. Please try again.");
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required scenario
          console.log("New password required");
          setError("Please contact administrator to set up your password.");
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login.");
    }
    setError("");

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log("Login successful:", result);
          onLoginSuccess({
            email,
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
          });
        },
        onFailure: (err) => {
          console.error("Login failed:", err);
          setError(err.message || "Invalid email or password. Please try again.");
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required scenario
          console.log("New password required");
          setError("Please contact administrator to set up your password.");
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* if we click on the logo, we will be redirected to the home page */}
        <div className="logo">
          <img src="logo.svg" alt="Logo" />
        </div>

        <h1>Welcome back!</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <span className="input-icon">
                <MdEmail />
              </span>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <span className="input-icon">
                <IoIosLock />
              </span>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          <div className="form-footer">
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
            <a href="signup" onClick={onSignupClick} className="back-to-signup">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
