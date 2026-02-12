import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import Document from "../models/Document.js";
import mongoose from "mongoose"; //
import dotenv from "dotenv"; //

// 1. Load environment variables from .env
dotenv.config();

// 2. Connect to MongoDB using the URI from your .env
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is missing from your .env file!");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() =>
      console.log("DATABASE STATUS: Successfully connected to MongoDB"),
    )
    .catch((err) => console.error("DATABASE STATUS: Connection failed", err));
}

const hocuspocusServer = new Server({
  port: 1234,

  // --- START OF DAY 11 PERSISTENCE EXTENSION ---
  extensions: [
    new Database({
      debounce: 500,

      fetch: async ({ documentName }) => {
        console.log(`🔎 DB FETCH: Searching for [${documentName}]`);
        try {
          const doc = await Promise.race([
            Document.findOne({ name: documentName }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 3000),
            ),
          ]);

          if (doc) {
            console.log("✅ DB FETCH: Document found.");
            return doc.data;
          }
          console.log("DB FETCH: New room, starting fresh.");
          return null;
        } catch (error) {
          console.error(
            "DB FETCH ERROR: Loading blank editor to prevent hang.",
          );
          return null; // Allows editor to open even if DB fails
        }
      },

      store: async ({ documentName, state }) => {
        console.log(`DB STORE: Attempting save for [${documentName}]`);
        try {
          await Document.findOneAndUpdate(
            { name: documentName },
            { data: state, updatedAt: new Date() },
            { upsert: true, new: true },
          );
          console.log(`DB STORE: Saved successfully to MongoDB.`);
        } catch (err) {
          console.error("DB STORE ERROR:", err);
        }
      },
    }),
  ],
  // --- END OF DAY 11 PERSISTENCE EXTENSION ---

  async onConnect(data) {
    console.log(`New connection attempt from: ${data.request.headers.origin}`);
    return;
  },

  async onAuthenticate(data) {
    try {
      console.log(`Authenticating connection for room: ${data.documentName}`);
      if (!data.documentName) {
        throw new Error("No document name");
      }
      return {
        user: { id: 1, name: "Dev B" },
      };
    } catch (err) {
      console.error("Authentication Error:", err.message);
      throw err;
    }
  },

  async onDisconnect(data) {
    console.log(`User disconnected.`);
  },
});

export default hocuspocusServer;
