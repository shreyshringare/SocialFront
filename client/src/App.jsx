import Editor from "./Editor";
import "./styles.scss";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [roomId, setRoomId] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
    } else {
      const newRoom = uuidv4();
      setRoomId(newRoom);
      window.history.replaceState(null, "", `?room=${newRoom}`);
    }
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link Copied! Send it to your partner.");
  };

  if (!roomId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header>
        <h3>Document: {roomId.slice(0, 8)}...</h3>
        <button
          onClick={copyLink}
          style={{ background: "black", color: "white" }}
        >
          Share Link
        </button>
      </header>
      {/* We pass the Room ID to the editor here */}
      <Editor documentId={roomId} />
    </div>
  );
}

export default App;
