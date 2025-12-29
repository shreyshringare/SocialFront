import { Server } from "@hocuspocus/server";

const hocuspocusServer = new Server({
  port: 1234,
  async onConnect(data) {
    console.log(`New connection attempt from: ${data.request.headers.origin}`);
    return;
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
