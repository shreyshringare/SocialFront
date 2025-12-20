// client/src/Editor.jsx
import "./styles.scss";
import { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

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
  // We use 'provider' to track the connection
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    // 1. Setup the Connection
    const ydoc = new Y.Doc();

    // Connect to Developer A's server (or your local test server)
    const wsProvider = new WebsocketProvider(
      "ws://localhost:1234",
      documentId,
      ydoc
    );

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  // 2. Configure Editor (Only when provider is ready)
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ history: false }), // Disable local history

        // The Sync Engine
        Collaboration.configure({
          document: provider ? provider.doc : new Y.Doc(),
        }),

        // The Cursors
        CollaborationCursor.configure({
          provider: provider,
          user: { name: "Dev B", color: getRandomColor() },
        }),
      ],
    },
    [provider]
  ); // Re-load when provider changes

  if (!editor || !provider) {
    return <div className="editor-container">Connecting...</div>;
  }

  return (
    <div className="editor-container">
      {/* Toolbar */}
      <div className="toolbar">
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

        {/* Connection Status Light */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: provider.wsconnected ? "green" : "red",
          }}
        >
          ● {provider.wsconnected ? "Online" : "Offline"}
        </span>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
