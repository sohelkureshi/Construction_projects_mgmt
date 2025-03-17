// /routes/posts.js
const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

router.post("/create", authorize(["contractor", "manager", "senior-manager", "admin"]), async (req, res) => {
  // Your CRUD logic here...
  res.json({ message: "Post created (pending senior manager approval, if applicable)" });
});

module.exports = router;
