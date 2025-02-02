const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

// Import Routes
const projectroutes = require("./routes/project");
const billroutes = require("./routes/bill");
const progressroutes = require("./routes/progress");
const linkRoutes = require("./routes/link");
const authRoutes = require("./routes/auth");

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
    // .then(() => console.log("Connected to MongoDB Atlas!"))
    // .catch(error => console.error("Initial connection error:", error));

const db = mongoose.connection;
// db.on("error", console.error.bind(console, "Ongoing connection error:"));
// db.once("open", () => // console.log$&;

// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./public")));

// Middleware
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Authentication Routes
app.use(authRoutes);

// Application Routes
app.use("/project", projectroutes);
app.use("/project/:id/bill", billroutes);
app.use("/project/:id/progress", progressroutes);
app.use(linkRoutes);

// JWT Middleware to Protect Routes
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        // // console.log$&;
        return res.redirect("/login");
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // console.error("Token verification failed:", err);
        res.clearCookie("token");
        res.redirect("/login");
    }
};

// Route Handlers
app.get("/", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/dashboard", verifyToken, (req, res) => res.render("dashboard"));
app.get("/drawings", (req, res) => res.render("drawings"));
app.get("/tender", (req, res) => res.render("tender"));

// Start server
const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => // console.log$&;
