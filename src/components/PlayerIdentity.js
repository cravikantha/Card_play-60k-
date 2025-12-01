// src/components/PlayerIdentity.js
import React, { useState, useEffect } from "react";

const LS_KEY = "playerName";

const PlayerIdentity = ({ onNameSet }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      setName(stored);
      if (typeof onNameSet === "function") onNameSet(stored);
    }
  }, [onNameSet]);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Please enter a valid name.");
      return;
    }
    localStorage.setItem(LS_KEY, trimmed);
    if (typeof onNameSet === "function") onNameSet(trimmed);
    alert(`Welcome, ${trimmed}!`);
  };

  const clear = () => {
    localStorage.removeItem(LS_KEY);
    setName("");
    if (typeof onNameSet === "function") onNameSet(null);
  };

  // If a name already exists we show a small change name UI, otherwise show input
  const stored = localStorage.getItem(LS_KEY);

  return (
    <div className="player-identity text-center mb-3">
      {!stored ? (
        <div className="d-flex flex-column align-items-center">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control w-50 mx-auto"
          />
          <button className="btn btn-warning mt-2" onClick={save}>
            Save Name
          </button>
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center gap-2">
          <div className="text-light">Player: <strong>{stored}</strong></div>
          <button className="btn btn-sm btn-outline-light" onClick={() => {
            const newName = prompt("Change your name:", stored);
            if (newName !== null) {
              const trimmed = newName.trim();
              if (trimmed) {
                localStorage.setItem(LS_KEY, trimmed);
                if (typeof onNameSet === "function") onNameSet(trimmed);
              }
            }
          }}>Change</button>
          <button className="btn btn-sm btn-danger" onClick={() => {
            if (window.confirm("Clear saved player name?")) clear();
          }}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default PlayerIdentity;
