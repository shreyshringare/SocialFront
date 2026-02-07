import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Plus, FileText, LogOut } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  // 1. Fetch real documents from MongoDB on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // FETCH real files using the User ID
        try {
          const response = await fetch(
            `http://localhost:3000/api/documents/${currentUser.uid}`,
          );
          if (response.ok) {
            const data = await response.json();
            setDocuments(data); // This fills your "Recent Documents" section
          }
        } catch (err) {
          console.error("Dashboard Fetch Error:", err);
        }
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Register the new document in MongoDB before navigating
  const createNewDocument = async () => {
    const newId = uuidv4();
    const userId = auth.currentUser?.uid; // Should be 'OjX21TsDXK...'

    try {
      // We must call Port 3000 to reach your Express server
      const response = await fetch(
        "http://localhost:3000/api/documents/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: newId,
            ownerId: userId,
            title: "Untitled document",
          }),
        },
      );

      if (response.ok) {
        console.log("Metadata created successfully!");
        navigate(`/document/${newId}`);
      }
    } catch (err) {
      console.error("Failed to create metadata record:", err);
    }
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
              key={doc.documentId}
              onClick={() => navigate(`/document/${doc.documentId}`)}
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
                  {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString()
                    : "Recent"}
                </p>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <p style={{ color: "#70757a" }}>
              No documents yet. Click '+' to start!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
