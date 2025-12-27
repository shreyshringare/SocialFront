import { Server } from "@hocuspocus/server";

const hocuspocusServer = new Server({
  port: 1234,
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
