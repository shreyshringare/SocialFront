\// client/src/Editor.jsx
import "./styles.scss";
import { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
];

const getRandomColor = () =>
  colors[Math.floor(Math.random() * colors.length)];

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
      url: "ws://localhost:1234",
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
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
