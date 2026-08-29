const express = require("express");
const User = require("../model/userSchema");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/users", authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.get("/pending-accounts", authorize("admin"), async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false }).sort({ name: 1 });
    res.json({ pendingUsers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/approve", authorize("admin"), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ message: "User approved" });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/users/:id", authorize("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User rejected and removed" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
