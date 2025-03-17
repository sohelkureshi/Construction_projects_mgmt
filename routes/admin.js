// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../model/userSchema");
const authorize = require("../middleware/authorize");

// Render the Role Management page for admin
router.get("/admin/roles", authorize("admin"), async (req, res) => {
  try {
    // Fetch all users except the admin account (adjust query as needed)
    const users = await User.find({ role: { $ne: "admin" } });
    res.render("role", { users });
  } catch (error) {
    console.error("Error fetching users for role management:", error);
    res.status(500).send("Error fetching users.");
  }
});

// (Optional) API endpoint to get pending user accounts
router.get("/pending-accounts", authorize("admin"), async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false });
    res.json({ pendingUsers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Approve a user account (by admin)
router.post("/admin/approve-user/:id", authorize("admin"), async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { approved: true });
    res.json({ message: "User approved" });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a user account (by admin)
// This endpoint deletes the user; alternatively, you could set a "rejected" flag instead.
router.post("/admin/reject-user/:id", authorize("admin"), async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User rejected and removed" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
