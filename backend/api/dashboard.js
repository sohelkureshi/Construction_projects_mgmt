const express = require("express");
const authorize = require("../middleware/authorize");
const Project = require("../model/projectSchema");
const { summarizeProjects } = require("../utils/projectMetrics");

const router = express.Router();

router.get(
  "/stats",
  authorize(["guest", "engineer", "contractor", "manager", "senior-manager", "admin"]),
  async (req, res) => {
    try {
      const projects = await Project.find({}).sort({ startDate: 1 });
      const summary = summarizeProjects(projects);

      res.json({
        ongoing: summary.ongoing,
        completed: summary.completed,
        totalProjects: projects.length,
        tasksDueToday: 5,
        upcomingDeadlines: 6,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
