"use client";

import { useState } from "react";
import "./Signup.css";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

function Signup({ onBackToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("reader");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup attempt with:", {
      fullName,
      email,
      password,
      userType,
    });
    // Signup logic here
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo">
          <div className="circle"></div>
        </div>

        <div className="user-type-selector">
          <label className="radio-label">
            <input
              type="radio"
              name="userType"
              value="reader"
              checked={userType === "reader"}
              onChange={() => setUserType("reader")}
            />
            <span className="radio-text">I'm a Reader</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="userType"
              value="librarian"
              checked={userType === "librarian"}
              onChange={() => setUserType("librarian")}
            />
            <span className="radio-text">I'm a Librarian</span>
          </label>
        </div>

        <h1>Get started!</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>
            <div className="input-container">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <button type="submit" className="signup-button">
            Sign up
          </button>

          <div className="form-footer">
            <a href="#" className="guest-link">
              Enter as a Guest
            </a>
            <a href="#" className="login-link" onClick={onBackToLogin}>
              <FaArrowLeftLong /> Go to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
