import { Server } from "@hocuspocus/server";

const hocuspocusServer = new Server({
  port: 1234,
  async onConnect(data) {
    console.log(`New connection attempt from: ${data.request.headers.origin}`);
    return;
  },

  // Added this to ensure the server doesn't "gatekeep" while we are testing
  async onAuthenticate(data) {
    try {
      console.log(
        `🔐 Authenticating connection for room: ${data.documentName}`
      );

      // If there is no room name, the connection will fail
      if (!data.documentName) {
        console.error("❌ No document name provided!");
        throw new Error("No document name");
      }

      return {
        user: { id: 1, name: "Dev B" },
      };
    } catch (err) {
      console.error("❌ Authentication Error:", err.message);
      throw err; // This tells the frontend why it was rejected
    }
  },

  // Log when someone leaves
  async onDisconnect(data) {
    console.log(`User disconnected.`);
  },
});

/*hocuspocusServer
  .listen()
  .then(() => {
    console.log("Hocuspocus Backend is now running on port 1234");
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });
*/
export default hocuspocusServer;
