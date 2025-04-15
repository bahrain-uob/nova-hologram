import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Replace YOUR_API_GATEWAY_URL with the actual API Gateway URL
    fetch("https://dn8qsiexp5.execute-api.us-east-1.amazonaws.com/upload", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <h1>Welcome to [Hologram Challenge].bh</h1>
      <p>Message from the Backend system: {message}</p>
    </div>
  );
}

export default App;
