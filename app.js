const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const adminRoutes = require("./routes/admin");
const projectroutes = require("./routes/project");
const billroutes = require("./routes/bill");
const progressroutes = require("./routes/progress");
const linkRoutes = require("./routes/link");
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/document");
const dashboardRoutes = require("./routes/dashboard");
const commentroutes = require("./routes/comment");
const session = require('express-session');
const User = require("./model/userSchema");
const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch(error => console.error("Initial connection error:", error));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Ongoing connection error:"));
db.once("open", () => console.log("Database connected"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./public")));

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to make user data available to all routes
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (err) {
      console.error("Token verification error:", err);
    }
  }
  next();
});

app.use(authRoutes);
app.use("/project", projectroutes);
app.use("/project/:id/bill", billroutes);
app.use("/project/:id/progress", progressroutes);
app.use("/project/:id/comment", commentroutes);
app.use(linkRoutes);
app.use("/", adminRoutes);
app.use("/dashboard", dashboardRoutes);

app.use(session({
  secret: 'iamtheking',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use("/project/:id", documentRoutes);

const verifyToken = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/drawings", verifyToken, (req, res) => res.render("drawings"));
// app.get("/tender", verifyToken, (req, res) => res.render("tender"));
// app.get("/documents", verifyToken, (req,res) => res.render("documents"));
app.get("/documents/:id", verifyToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await mongoose.model('Project').findById(projectId);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    res.render("documents", { project, user: req.user });
  } catch (err) {
    console.error("Error fetching project for documents page:", err);
    res.status(500).send("Server error");
  }
});
app.get("/documents", verifyToken, (req, res) => {
  res.redirect("/project"); // Redirect to projects page if no project ID is specified
});
app.get('/project', (req, res) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  res.render('listofprojects', { user: req.user, projects: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
