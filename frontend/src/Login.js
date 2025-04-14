"use client";

import { useState } from "react";
import "./Login.css";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";
// import Amplify, { Auth } from "aws-amplify";
// import awsConfig from "./aws-exports";

// Amplify.configure(awsConfig);

function Login({ onBackToHome, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // try {
    //   const user = await Auth.signIn(email, password);
    //   console.log("Login successful:", user);
    //   onLoginSuccess(); // Call the success callback
    // } catch (err) {
    //   console.error("Login failed:", err);
    //   setError("Invalid email or password. Please try again.");
    // }
    console.log("Login attempt with:", { email, password });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <div className="circle"></div>
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
            <a href="#" className="back-to-signup">
              ← Back to Signup
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
