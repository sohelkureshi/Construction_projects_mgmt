const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const Project = mongoose.model("Project");

// Middleware to check if user is authenticated
const isLoggedIn = (req, res, next) => {
  if (!req.user) {
    return res.status(401).redirect("/login");
  }
  next();
};

// Middleware to check if user has permission
const hasPermission = (req, res, next) => {
  const allowedRoles = ["engineer", "contractor", "senior-manager", "manager", "admin"];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).send("You don't have permission to perform this action");
  }
  next();
};

// Route to upload a drawing
router.post("/drawing/upload", isLoggedIn, hasPermission, async (req, res) => {
  try {
    const { title, link } = req.body;
    const projectId = req.params.id;
    
    if (!title || !link) {
      return res.status(400).json({ error: "Title and link are required" });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Initialize drawings array if it doesn't exist
    if (!project.drawings) {
      project.drawings = [];
    }
    
    // Add new drawing
    project.drawings.push({
      title,
      link,
      date: new Date(),
      user_id: req.user._id,
      user_name: req.user.name,
      image: '/images/default-drawing.png'
    });
    
    await project.save();
    
    res.status(200).json({ success: true, drawing: project.drawings[project.drawings.length - 1] });
  } catch (err) {
    console.error("Error uploading drawing:", err);
    res.status(500).json({ error: "Failed to upload drawing" });
  }
});

// Route to upload a tender document
router.post("/tender/upload", isLoggedIn, hasPermission, async (req, res) => {
  try {
    const { title, link } = req.body;
    const projectId = req.params.id;
    
    if (!title || !link) {
      return res.status(400).json({ error: "Title and link are required" });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Initialize tenders array if it doesn't exist
    if (!project.tenders) {
      project.tenders = [];
    }
    
    // Add new tender document
    project.tenders.push({
      title,
      link,
      date: new Date(),
      user_id: req.user._id,
      user_name: req.user.name,
      image: '/images/default-tender.png'
    });
    
    await project.save();
    
    res.status(200).json({ success: true, tender: project.tenders[project.tenders.length - 1] });
  } catch (err) {
    console.error("Error uploading tender document:", err);
    res.status(500).json({ error: "Failed to upload tender document" });
  }
});

module.exports = router;