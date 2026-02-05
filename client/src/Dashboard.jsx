import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Plus, FileText, LogOut } from "lucide-react"; // Icons for the UI
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]); // This will hold your file list
  const navigate = useNavigate();

  // 1. Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // For now, we show a dummy document to test the UI
        setDocuments([
          {
            id: "test-doc-123",
            title: "My First Document",
            updatedAt: new Date().toLocaleDateString(),
          },
        ]);
      } else {
        navigate("/"); // If not logged in, kick them back to Login
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Function to create a NEW document
  const createNewDocument = () => {
    const newId = uuidv4();
    // In Phase 3, we will save this ID to MongoDB
    navigate(`/document/${newId}`);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) return <div className="loading">Loading your files...</div>;

  return (
    <div
      className="dashboard-container"
      style={{ background: "#f8f9fa", minHeight: "100vh" }}
    >
      {/* Dashboard Header */}
      <header
        style={{
          background: "white",
          padding: "10px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="https://cdn.worldvectorlogo.com/logos/svg-2.svg"
            width="30"
            alt="logo"
          />
          <h2 style={{ fontSize: "1.2rem", color: "#5f6368" }}>Docs</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "0.9rem", color: "#5f6368" }}>
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#5f6368",
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* "Start New Document" Section */}
      <div style={{ background: "#f1f3f4", padding: "40px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ marginBottom: "15px", color: "#202124" }}>
            Start a new document
          </p>
          <div
            onClick={createNewDocument}
            style={{
              width: "150px",
              height: "190px",
              background: "white",
              border: "1px solid #dadce0",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#1a73e8")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#dadce0")}
          >
            <Plus size={48} color="#1a73e8" />
          </div>
          <p
            style={{
              marginTop: "10px",
              fontSize: "0.8rem",
              fontWeight: "bold",
            }}
          >
            Blank
          </p>
        </div>
      </div>

      {/* Recent Documents List */}
      <div
        style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}
      >
        <p style={{ marginBottom: "20px", fontWeight: "500" }}>
          Recent documents
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "20px",
          }}
        >
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/document/${doc.id}`)}
              style={{
                background: "white",
                border: "1px solid #dadce0",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  height: "140px",
                  borderBottom: "1px solid #f1f3f4",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#1a73e8",
                }}
              >
                <FileText size={40} />
              </div>
              <div style={{ padding: "10px" }}>
                <p
                  style={{
                    fontSize: "0.9rem",
                    margin: "0",
                    fontWeight: "500",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {doc.title}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "#70757a",
                    marginTop: "5px",
                  }}
                >
                  Opened {doc.updatedAt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
