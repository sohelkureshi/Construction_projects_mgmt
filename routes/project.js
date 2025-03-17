const express = require("express");
const router = express.Router({ mergeParams: true });
const Project = require("../model/projectSchema");
const authorize = require("../middleware/authorize");

// Middleware to ensure `user` is always passed to views
router.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ startDate: 1 });
    res.render("listofprojects", { 
      projects,
      user: req.user // Explicitly pass user information
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send("Server error");
  }
});

// Add project page (Only Manager, Contractor, Admin can access)
router.get("/addproject", authorize(["manager", "contractor", "admin"]), (req, res) => {
  res.render("addproject", { user: req.user });
});
// Handle project addition (Only Manager, Contractor, Admin can add)
router.post("/addproject", authorize(["manager", "contractor", "admin"]), async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.redirect("/project");
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).send("Error adding project");
  }
});
// Get project details
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send("Project not found");
    res.render("project_details", { 
      project,
      user: req.user // Explicitly pass user information
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).send("Server error");
  }
});

// Edit project page (Only Manager, Contractor, Admin can edit)
router.get("/:id/editproject", authorize(["manager", "contractor", "admin"]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send("Project not found");
    res.render("editproject", { project });
  } catch (error) {
    console.error("Error fetching project for edit:", error);
    res.status(500).send("Server error");
  }
});

// Handle project update (Only Manager, Contractor, Admin can update)
router.put("/:id/editproject", authorize(["manager", "contractor", "admin"]), async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedProject) return res.status(404).send("Project not found");
    res.redirect(`/project/${req.params.id}`);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
