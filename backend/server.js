const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");

require("dotenv").config();

const authRoutes = require("./api/auth");
const adminRoutes = require("./api/admin");
const dashboardRoutes = require("./api/dashboard");
const projectRoutes = require("./api/projects");
const linkRoutes = require("./routes/link");
const { attachUser } = require("./middleware/authenticate");

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const io = socketio(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
  },
});

app.set("io", io);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/links", linkRoutes);

io.on("connection", (socket) => {
  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
});
