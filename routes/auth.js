// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Signup request received with:", { name, email, password, role });
    
    // If the user is signing up as admin, enforce the correct email
    if (role === "admin" && email !== "admin@gmail.com") {
      return res.status(400).json({ message: "Admin must sign up with admin@gmail.com" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine approval status:
    // - Guests and Admins are auto-approved.
    // - All other roles require manual approval.
    let approved = false;
    if (role === "guest" || role === "admin") {
      approved = true;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, approved });
    await user.save();
    console.log("User saved:", user);

    // If not approved, send a pending approval message.
    if (!approved) {
      return res.status(200).json({ message: "Signup successful – your account is pending approval", redirect: "/login" });
    }

    // If approved, generate a JWT and log in immediately.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    return res.status(200).json({ message: "Signup successful", redirect: "/dashboard" });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    // Check if account is approved (except guests and admin which are auto-approved)
    if (!user.approved && user.role !== "guest" && user.role !== "admin") {
      return res.status(403).json({ message: "Your account is pending approval" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    console.log("Login successful, sending response");
    return res.status(200).json({ message: "Login successful", redirect: "/dashboard" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
