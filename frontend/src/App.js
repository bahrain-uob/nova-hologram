import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("none"); // none, login, signup
  const [showDashboard, setShowDashboard] = useState(false);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://d-9067828166.awsapps.com/start", {
          method: "GET",
          redirect: "follow", // Allow following redirects
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON, but got: ${text}`);
        }

        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to fetch data from the server.");
      }
    };

    fetchData();
  }, []);

  if (isLoggedIn || showDashboard) {
    return <Dashboard userData={userData} />;
  }

  if (authMode === "login") {
    return (
      <Login 
        onBackToHome={() => setAuthMode("none")} 
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setUserData(user);
        }}
        onSignupClick={() => setAuthMode("signup")}
      />
    );
  }

  if (authMode === "signup") {
    return (
      <Signup 
        onBackToLogin={() => setAuthMode("login")}
      />
    );
  }

  return (
    <Router>
      <Routes>
        {/* Redirect to /dashboard if logged in, otherwise to login */}
        {/* <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        /> */}

        {/* Default route for "/" */}
        <Route
          path="/"
          element={
            <div>
              <h1>Welcome to [ChallengeName].bh</h1>
              <p>Message from the Backend system: {message}</p>
              <div className="button-container">
                <button
                  className="cta-button"
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  className="cta-button"
                  onClick={() => setAuthMode("signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLoginSuccess={() => setIsLoggedIn(true)} />
            )
          }
        />

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

