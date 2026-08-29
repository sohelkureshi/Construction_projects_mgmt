const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const { COOKIE_NAME, requireAuth } = require("../middleware/authenticate");

const router = express.Router();

const ADMIN_EMAIL = "admin@gmail.com";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60,
};

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role === "admin" && email !== ADMIN_EMAIL) {
      return res.status(400).json({ message: `Admin must sign up with ${ADMIN_EMAIL}` });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const approved = role === "guest" || role === "admin";
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      approved,
    });

    if (!approved) {
      return res.status(201).json({
        message: "Signup successful. Your account is pending approval.",
      });
    }

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.status(201).json({ message: "Signup successful", user });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.approved && user.role !== "guest" && user.role !== "admin") {
      return res.status(403).json({ message: "Your account is pending approval" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_OPTIONS.secure,
  });
  res.status(200).json({ message: "Logged out" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
