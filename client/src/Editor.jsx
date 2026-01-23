// client/src/Editor.jsx

import "./styles.scss";
import { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import {
  Bold,
  Italic,
  Strikethrough,
  Undo,
  Redo,
  List,
  Heading1,
  Heading2,
  Code,
  Minus,
  Image as ImageIcon,
  Upload,
  Share2,
} from "lucide-react";

const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const Editor = ({ documentId }) => {
  // Hard safety guard
  if (!documentId) {
    return <div className="editor-container">Missing documentId</div>;
  }

  const [provider, setProvider] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("offline");

  // 1️⃣ Create Yjs document + Hocuspocus provider
  useEffect(() => {
    const ydoc = new Y.Doc();

    const wsProvider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: documentId || "default-room",
      document: ydoc,
      connect: true,
    });

    // --- NEW: Status Listener Logic ---
    // This listens for the '101' handshake you saw in the network tab
    wsProvider.on("status", ({ status }) => {
      console.log("WebSocket Status Update:", status);
      // This will update your 'connectionStatus' state to 'connected'
      setConnectionStatus(status);
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.off("status");
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  // 2️⃣ Build extensions (StarterKit ALWAYS present)
  // const extensions = useMemo(() => {
  //   const baseExtensions = [
  //     StarterKit.configure({ history: false }),
  //     ImageResize,
  //   ];

  //   if (!provider) {
  //     return baseExtensions;
  //   }

  //   if (!provider.wsconnected) {
  //     return baseExtensions;
  //   }

  //   return [
  //     ...baseExtensions,

  //     Collaboration.configure({
  //       document: provider.doc,
  //       field: "content",
  //     }),

  //     CollaborationCursor.configure({
  //       provider: provider,
  //       user: {
  //         name: "Dev B",
  //         color: getRandomColor(),
  //       },
  //     }),
  //   ];
  // }, [provider, provider?.wsconnected]);

  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({ history: false }),
      ImageResize,
    ];

    // 1. SAFETY: Check if the provider OR its document is missing.
    // This prevents the "getXmlFragment" crash while the page loads.
    if (!provider || !provider.doc) {
      return baseExtensions;
    }

    // 2. THE BRIDGE: Now that doc exists, we can safely add collaboration.
    // We DO NOT check wsconnected here anymore.
    return [
      ...baseExtensions,
      Collaboration.configure({
        document: provider.doc, // Connects the editor to the server's data
        field: "content", // Matches standard Hocuspocus configuration
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: "Dev B",
          color: getRandomColor(),
        },
      }),
    ];
  }, [provider, provider?.doc]); // Re-run only when the provider or document object is ready

  const editorKey = provider?.doc ? "ready" : "loading";

  const editor = useEditor(
    {
      // 2. The key forces TipTap to re-render safely
      key: editorKey,
      extensions: extensions,
      // Add this to ensure it doesn't try to render content before the doc exists
      content: "",
    },
    // 3. Re-run whenever the extensions (which depend on the doc) change
    [extensions],
  );

  // 4️⃣ Loading state
  if (!editor || !provider) {
    return <div className="editor-container">Connecting...</div>;
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    /*

    const localUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: localUrl }).run();
    
    */

    // 1. Create a "FormData" package to send the file
    const formData = new FormData();
    formData.append("image", file);

    try {
      // 2. Send the file to Developer A's API
      // Note: Use http://localhost:3000/upload (or whatever port Dev A uses)
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // 3. Insert the image into Tiptap using the URL returned by the server
        // The server usually returns { url: "http://..." }
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        console.error("Upload failed");
        alert("Failed to upload image to server.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Server not responding. Is the Backend running?");
    }
  };

  const copyRoomLink = () => {
    // 1. Get the current URL from the address bar
    const url = window.location.href;

    // 2. Copy it to the clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // 3. Show a little message so the user knows it worked
        alert("Room link copied to clipboard! Share it with a friend.");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="google-docs-app">
      {/* 1. THE TOP HEADER: Title and Share Button */}
      <header className="docs-header">
        <div className="header-left">
          <div className="docs-logo">
            {/* Official Google Docs Icon for similarity */}
            <img
              src="https://cdn.worldvectorlogo.com/logos/svg-2.svg"
              alt="logo"
              width="36"
            />
          </div>
          <div className="title-section">
            <input
              type="text"
              className="docs-title-input"
              //defaultValue="Untitled document"
              placeholder="Untitled document"
            />
          </div>
        </div>

        <div className="header-right">
          <div className="status-container">
            <span
              className={`status-dot ${connectionStatus === "connected" ? "online" : "offline"}`}
            >
              ●
            </span>
            <span className="status-text">
              {connectionStatus === "connected"
                ? "Saved to Drive"
                : "Reconnecting..."}
            </span>
          </div>
          <button className="docs-share-button" onClick={copyRoomLink}>
            <Share2 size={18} /> Share
          </button>
        </div>
      </header>

      {/* 2. THE TOOLBAR: Pill-shaped icon bar */}
      <div className="toolbar-wrapper">
        <div className="google-toolbar">
          {/* History Group */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo size={18} />
          </button>

          <div className="toolbar-divider" />

          {/* Text Style Group */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "active" : ""}
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "active" : ""}
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "active" : ""}
          >
            <Strikethrough size={18} />
          </button>

          <div className="toolbar-divider" />

          {/* Heading/List Group */}
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
          >
            H1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "active" : ""}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "active" : ""}
          >
            <Code size={18} />
          </button>

          <div className="toolbar-divider" />

          {/* Media Group */}
          <button
            onClick={() => {
              const url = window.prompt("Paste image URL:");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
          >
            <ImageIcon size={18} />
          </button>
          <button onClick={() => document.getElementById("fileInput").click()}>
            <Upload size={18} />
          </button>
        </div>
      </div>

      {/* 3. THE CANVAS: White paper on gray background */}
      <main className="docs-canvas">
        <div className="page-container">
          {provider?.doc ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="loading-state">
              <p>Connecting to secure database...</p>
            </div>
          )}
        </div>
      </main>

      <input
        type="file"
        id="fileInput"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </div>
  );
};

// This component ONLY runs when the database is 100% ready
const ConnectedEditor = ({ extensions }) => {
  const editor = useEditor(
    {
      extensions,
      content: "",
    },
    [extensions],
  );

  return <EditorContent editor={editor} />;
};

export default Editor;
