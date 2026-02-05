import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import connectMongo from "./persistence/mongo.js";
import hocuspocusServer from "./collaborations/hocuspocus.js";

import cors from "cors"; // Add this with your other imports
// ...

const app = express();
app.use(cors()); // Add this right after 'const app = express()'

// 1. ADD THIS LINE BELOW 'const app = express()'
// This allows your server to read the data we send from the Dashboard
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ... (Your existing errorCatcher and requestLogger)

// ---------- NEW PHASE 3 ROUTES ----------

// Change the POST route
app.post("/api/documents/create", async (req, res) => {
  const { documentId, ownerId, title } = req.body;
  try {
    const client = await connectMongo(); // Get the client
    const db = client.db(); // Then get the db
    await db.collection("document_metadata").insertOne({
      documentId,
      ownerId,
      title: title || "Untitled document",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Change the GET route
app.get("/api/documents/:userId", async (req, res) => {
  try {
    const client = await connectMongo();
    const db = client.db();
    const userDocs = await db
      .collection("document_metadata")
      .find({ ownerId: req.params.userId })
      .toArray();
    res.json(userDocs);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});
// ---------- MIDDLEWARE ----------
const errorCatcher = (err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something Broke");
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
};

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.send("root");
});

app.get("/health", requestLogger, (req, res) => {
  res.send("OK");
});

app.get("/status", requestLogger, (req, res) => {
  res.send("Server Running");
});

app.get("/crash", (req, res) => {
  throw new Error("Crashhhhh");
});

// ---------- ERROR HANDLER ----------
app.use(errorCatcher);

// ---------- START SERVERS ----------
const startServer = async () => {
  try {
    await connectMongo();

    // Start Express (API server)
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Express running on http://localhost:${PORT}`);
    });

    // Start Hocuspocus (Collaboration server)
    hocuspocusServer.listen(1234).then(() => {
      console.log("Hocuspocus is officially listening on port 1234");
    });
  } catch (err) {
    console.error("Server failed.", err);
    process.exit(1);
  }
};

startServer();
