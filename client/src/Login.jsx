import React, { useState } from "react";
import { auth } from "./firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        // This creates a NEW user in Firebase
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // This LOGS IN an existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard"); // Once logged in, go to the dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "350px",
          textAlign: "center",
        }}
      >
        <img
          src="https://cdn.worldvectorlogo.com/logos/svg-2.svg"
          width="50"
          alt="logo"
        />
        <h2>{isRegistering ? "Create Account" : "Sign In"}</h2>
        <p>to continue to Google Docs Clone</p>

        <form
          onSubmit={handleAuth}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
          <button
            type="submit"
            style={{
              padding: "10px",
              background: "#1a73e8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            fontSize: "14px",
            cursor: "pointer",
            color: "#1a73e8",
          }}
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering
            ? "Already have an account? Sign in"
            : "New user? Create an account"}
        </p>
      </div>
    </div>
  );
};

export default Login;
