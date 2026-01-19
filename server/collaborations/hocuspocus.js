import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database"; // Ensure this is installed
import Document from "../models/Document.js"; // Import the model we created

const hocuspocusServer = new Server({
  port: 1234,

  // --- START OF DAY 11 PERSISTENCE EXTENSION ---
  extensions: [
    new Database({
      // Save every 500ms after typing stops
      debounce: 500,

      fetch: async ({ documentName }) => {
        console.log(`DB FETCH: Looking for [${documentName}]`);
        try {
          const doc = await Document.findOne({ name: documentName }).exec();
          if (doc) {
            console.log(`DB FETCH: Found data (${doc.data.length} bytes)`);
            return doc.data;
          }
          console.log(`DB FETCH: No existing data for this room.`);
          return null;
        } catch (err) {
          console.error("DB FETCH ERROR:", err.message);
          return null;
        }
      },


      store: async ({ documentName, state }) => {
        console.log(`DB STORE: Attempting save for [${documentName}]`);
        try {
          const result = await Document.findOneAndUpdate(
            { name: documentName },
            { data: state, updatedAt: new Date() },
            { upsert: true, new: true }
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
        console.error("No document name provided!");
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
