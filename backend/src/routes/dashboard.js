const express = require("express");
const Project = require("../models/projectSchema");
const { authenticate } = require("../middleware/auth");
const { getProjectStatus, serializeProject } = require("../utils/project-status");
const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ expectedDate: 1 });
    const projectsWithFinishDate = projects.filter((project) => project.expectedDate);
    const ongoing = projectsWithFinishDate.filter((project) => getProjectStatus(project.expectedDate) === "In progress").length;
    const completed = projectsWithFinishDate.filter((project) => getProjectStatus(project.expectedDate) === "Completed").length;
    const upcoming = projectsWithFinishDate.filter((project) => getProjectStatus(project.expectedDate) === "In progress").slice(0, 5);
    res.json({ metrics: { total: projects.length, ongoing, completed, upcoming: upcoming.length }, projects: upcoming.map(serializeProject) });
  } catch (error) { next(error); }
});
module.exports = router;
