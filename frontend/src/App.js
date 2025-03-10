import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Replace YOUR_API_GATEWAY_URL with the actual API Gateway URL
    fetch("YOUR_API_GATEWAY_URL")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <h1>Welcome to [ChallengeName].bh</h1>
      <p>Message from the Backend system: {message}</p>
    </div>
  );
}

export default App;
