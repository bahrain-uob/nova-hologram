"use client";

import { useState } from "react";
import Link from "next/link";
import { IoIosLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });
    // Login logic here
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
            <Link href="#" className="forgot-password">
              Forgot password?
            </Link>
            <Link href="/signup" className="back-to-signup">
              ← Back to Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
