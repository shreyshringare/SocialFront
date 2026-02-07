import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import cors from "cors";
import connectMongo from "./persistence/mongo.js";
import hocuspocusServer from "./collaborations/hocuspocus.js";

const app = express();

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
};

// ---------- PHASE 3: DOCUMENT MANAGEMENT ROUTES ----------

// 1. CREATE Route - Updated to use the new connection logic
app.post("/api/documents/create", async (req, res) => {
  const { documentId, ownerId, title } = req.body;
  try {
    const db = await connectMongo();
    await db.collection("document_metadata").insertOne({
      documentId,
      ownerId,
      title: title || "Untitled document",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. FETCH ALL Route - Updated to remove .db()
app.get("/api/documents/:userId", async (req, res) => {
  try {
    const db = await connectMongo();
    const userDocs = await db
      .collection("document_metadata")
      .find({ ownerId: req.params.userId })
      .toArray();

    res.json(userDocs);
  } catch (error) {
    console.error("FETCH LIST ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. FETCH ONE Route - Updated to remove .db()
app.get("/api/documents/metadata/:documentId", async (req, res) => {
  try {
    const db = await connectMongo();
    const doc = await db.collection("document_metadata").findOne({
      documentId: req.params.documentId,
    });
    res.json(doc || { title: "Untitled document" });
  } catch (error) {
    console.error("FETCH METADATA ERROR:", error);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

// 4. UPDATE Route - Updated to remove .db()
app.patch("/api/documents/update-title", async (req, res) => {
  const { documentId, title } = req.body;
  try {
    const db = await connectMongo();
    await db
      .collection("document_metadata")
      .updateOne(
        { documentId: documentId },
        { $set: { title: title, updatedAt: new Date() } },
      );
    res.json({ success: true });
  } catch (error) {
    console.error("UPDATE TITLE ERROR:", error);
    res.status(500).json({ error: "Failed to update title" });
  }
});

// ---------- GENERAL ROUTES ----------
app.get("/", (req, res) => res.send("root"));
app.get("/health", requestLogger, (req, res) => res.send("OK"));
app.get("/status", requestLogger, (req, res) => res.send("Server Running"));

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something Broke");
});

// ---------- START SERVERS ----------
const startServer = async () => {
  try {
    await connectMongo();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Express running on http://localhost:${PORT}`);
    });

    hocuspocusServer.listen(1234).then(() => {
      console.log("Hocuspocus is officially listening on port 1234");
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
};

startServer();
