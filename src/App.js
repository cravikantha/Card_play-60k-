// src/App.js
import React, { useState, useEffect } from "react";
import Game60K from "./pages/Game";
import AuthPage from "./pages/AuthPage";

function App() {
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentUser")
  );

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) setCurrentUser(saved);
  }, []);

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }
  };

  return (
    <div>
      {!currentUser ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Game60K onLogout={handleLogout} currentUser={currentUser} />
      )}
    </div>
  );
}

export default App;
