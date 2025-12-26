import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import connectMongo from "./persistence/mongo.js";
import hocuspocusServer from "./collaborations/hocuspocus.js";

const app = express();

const PORT = process.env.PORT || 5000;

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
      console.log(`🚀 Express running on http://localhost:${PORT}`);
    });

    // Start Hocuspocus (Collaboration server)
    hocuspocusServer.listen();
    console.log("🟢 Hocuspocus WebSocket running on ws://localhost:1234");

  } catch (err) {
    console.error("Server failed.", err);
    process.exit(1);
  }
};

startServer();
