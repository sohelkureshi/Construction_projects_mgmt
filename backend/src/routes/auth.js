const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 8,
};

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, role = "guest" } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Use a password with at least 8 characters." });
    if (role === "admin") return res.status(403).json({ message: "Administrator accounts are managed through the server environment." });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: "An account with this email already exists." });

    const approved = role === "guest" || role === "admin";
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 12), role, approved });
    if (!approved) return res.status(201).json({ message: "Your account has been submitted for approval." });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.cookie("token", token, cookieOptions).status(201).json({ user: { id: user.id, name: user.name, role: user.role, approved: user.approved } });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Incorrect email or password." });
    if (!user.approved) return res.status(403).json({ message: "Your account is awaiting administrator approval." });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.cookie("token", token, cookieOptions).json({ user: { id: user.id, name: user.name, role: user.role, approved: user.approved } });
  } catch (error) { next(error); }
});

router.post("/logout", (req, res) => res.clearCookie("token", cookieOptions).status(204).send());
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));
module.exports = router;
