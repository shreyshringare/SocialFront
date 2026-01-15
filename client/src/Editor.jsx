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

  // 1️⃣ Create Yjs document + Hocuspocus provider
  useEffect(() => {
    const ydoc = new Y.Doc();

    const wsProvider = new HocuspocusProvider({
      url: "ws://127.0.0.1:1234",
      name: documentId,
      document: ydoc,
      connect: true,
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  // 2️⃣ Build extensions (StarterKit ALWAYS present)
  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({ history: false }),
      ImageResize,
    ];

    if (!provider) {
      return baseExtensions;
    }

    if (!provider.wsconnected) {
      return baseExtensions;
    }

    return [
      ...baseExtensions,

      Collaboration.configure({
        document: provider.doc,
        field: "content",
      }),

      CollaborationCursor.configure({
        provider,
        user: {
          name: "Dev B",
          color: getRandomColor(),
        },
      }),
    ];
  }, [provider, provider?.wsconnected]);

  // 3️⃣ Create TipTap editor
  const editor = useEditor(
    {
      extensions,
    },
    [extensions]
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
    <div className="editor-container">
      {/* --- DAY 5 TOOLBAR (Updated with more buttons) --- */}
      <div className="toolbar">
        {/* Basic Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          Strike
        </button>

        {/* Headings */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet List
        </button>

        {/* Code Block & Horizontal Rule */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          Code Block
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Divider
        </button>

        {/* Undo/Redo */}
        <button
          onClick={() => {
            console.log("Undo clicked"); // Check your console to see if this triggers
            editor.chain().focus().undo().run();
          }}
          // For Day 10, let's remove the faded-button class temporarily
          // to see if the buttons actually work when clicked.
          className="toolbar-button"
        >
          Undo
        </button>

        <button
          onClick={() => {
            console.log("Redo clicked");
            editor.chain().focus().redo().run();
          }}
          className="toolbar-button"
        >
          Redo
        </button>

        {/* Option A: Insert from Web */}
        <button
          onClick={() => {
            const url = window.prompt("Paste image URL from web:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className="toolbar-button"
        >
          Web Image
        </button>

        {/* Option B: Upload from System */}
        <button
          onClick={() => document.getElementById("fileInput").click()}
          className="toolbar-button"
        >
          Upload Image
        </button>

        {/* Connection status */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: provider.wsconnected ? "green" : "red",
          }}
        >
          ● {provider.wsconnected ? "Online" : "Offline"}
        </span>

        <button
          onClick={copyRoomLink}
          className="toolbar-button share-button"
          style={{
            marginLeft: "10px",
            backgroundColor: "#6366f1",
            color: "white",
          }}
        >
          Copy Link
        </button>
      </div>

      <EditorContent editor={editor} />
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

export default Editor;
