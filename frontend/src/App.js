import React, { useEffect, useState } from "react";
import Login from "./Login";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Replace YOUR_API_GATEWAY_URL with the actual API Gateway URL
    fetch("YOUR_API_GATEWAY_URL")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  if (showLogin) {
    return <Login onBackToHome={() => setShowLogin(false)} />;
  }

  return (
    <div>
      <h1>Welcome to [ChallengeName].bh</h1>
      <p>Message from the Backend system: {message}</p>
      <button className="login-button" onClick={() => setShowLogin(true)}>
        Go to Login
      </button>
    </div>
  );
}

export default App;
