// src/pages/AuthPage.js
import React, { useState } from "react";
import "../styles/app.css";
import { supabase } from "../supabaseClient";

const AuthPage = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  const [displayName, setDisplayName] = useState("");

  // ------------------------------------
  // REGISTER (SIGNUP) + DISPLAY NAME
  // ------------------------------------
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      alert("⚠ Please fill all fields including Display Name.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,   
        },
      },
    });

    if (error) {
      alert("Registration failed ❌: " + error.message);
      return;
    }

    alert("✅ Registration successful! Please verify your email then log in.");
    setIsRegistering(false);
  };

  // ------------------------------------
  // LOGIN (SIGN-IN)
  // ------------------------------------
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("⚠ Enter your email + password.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed ❌: " + error.message);
      return;
    }

    // GET DISPLAY NAME after login
    const { user } = data;

    const name =
      user.user_metadata?.display_name ||
      email.split("@")[0]; // fallback to email-first-part

    localStorage.setItem("currentUser", name);  // now saved properly

    onLoginSuccess(name);
    console.log("Logged In As:", name);
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-light">
      <h1 className="text-warning mb-4">
        {isRegistering ? "Register" : "Login"} to Play 60K
      </h1>

      <div className="card bg-secondary p-4" style={{ minWidth: "320px" }}>
        
        {/* Email */}
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Display Name only required for register */}
        {isRegistering && (
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}

        {/* Password */}
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isRegistering ? (
          <button className="btn btn-warning w-100 mb-2" onClick={handleRegister}>
            Register
          </button>
        ) : (
          <button className="btn btn-success w-100 mb-2" onClick={handleLogin}>
            Login
          </button>
        )}

        <button
          className="btn btn-outline-light w-100"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Already have an account? Login" : "No account? Register"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
