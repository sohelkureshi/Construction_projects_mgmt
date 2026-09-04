require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const app = require("./app");
const { bootstrapAdmin } = require("./utils/bootstrap-admin");

const port = Number(process.env.PORT || 3000);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: frontendUrl, credentials: true } });

app.set("io", io);
io.on("connection", (socket) => socket.on("project:join", (projectId) => socket.join(projectId)));
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the existing API process or choose another PORT in backend/.env.`);
  } else {
    console.error("HTTP server failed to start:", error.message);
  }
  process.exit(1);
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured in backend/.env.");
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    await bootstrapAdmin();

    server.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
      console.log(`Allowed frontend origin: ${frontendUrl}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
