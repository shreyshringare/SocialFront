import React from "react";
// 1. We import these tools to manage different "pages"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Editor from "./Editor";
import Dashboard from "./Dashboard";

// 2. This is a temporary placeholder for your Dashboard
// We will build the real Dashboard.jsx in Phase 2

function App() {
  return (
    <Router>
      <Routes>
        {/* 3. The first screen people see is now the Login */}
        <Route path="/" element={<Login />} />

        {/* 4. After login, users land here to see their files */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 5. This opens your existing Editor based on the ID in the URL */}
        <Route path="/document/:documentId" element={<Editor />} />

        {/* 6. Catch-all: If a URL is wrong, go back to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
