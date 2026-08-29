const express = require("express");
const multer = require("multer");
const Project = require("../model/projectSchema");
const Bill = require("../model/billSchema");
const Comment = require("../model/commentSchema");
const Progress = require("../model/progressSchema");
const authorize = require("../middleware/authorize");
const { calculateProjectProgress } = require("../utils/projectMetrics");
const { storage } = require("../cloudinary/index");

const router = express.Router();
const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ startDate: 1 });
    res.json({
      projects: projects.map((project) => ({
        ...project.toObject(),
        timelineProgress: calculateProjectProgress(project.startDate, project.expectedDate),
      })),
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authorize(["manager", "contractor", "admin"]), async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ project });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: "Error adding project" });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("bills")
      .populate("progresses")
      .populate("comments");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      project: {
        ...project.toObject(),
        timelineProgress: calculateProjectProgress(project.startDate, project.expectedDate),
      },
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:projectId", authorize(["manager", "contractor", "admin"]), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:projectId/bills", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("bills");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project, bills: project.bills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project" });
  }
});

router.post("/:projectId/bills", authorize(["engineer", "contractor", "admin"]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const payload = req.body.bill || req.body;
    const bill = await Bill.create({
      ...payload,
      created_by: [{ name: req.user.name, role: req.user.role }],
    });

    project.bills.push(bill._id);
    await project.save();

    res.status(201).json({ bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding bill" });
  }
});

router.get("/:projectId/bills/:billId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const bill = await Bill.findById(req.params.billId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const previousBill = await Bill.findOne({
      date: { $lt: bill.date },
      _id: { $in: project.bills, $ne: req.params.billId },
    }).sort({ date: -1 });

    res.json({
      project,
      bill,
      previousAmount: previousBill ? previousBill.total_amount : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching bill" });
  }
});

router.put("/:projectId/bills/:billId", authorize(["contractor", "senior-manager", "manager", "admin"]), async (req, res) => {
  try {
    const payload = req.body.bill || req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.billId,
      {
        $set: {
          ...payload,
          created_by: [{ name: req.user.name, role: req.user.role }],
        },
      },
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({ bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating bill" });
  }
});

router.get("/:projectId/progress", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("progresses");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const startDate = project.startDate ? new Date(project.startDate) : null;
    const endDate = project.expectedDate ? new Date(project.expectedDate) : null;
    const now = new Date();
    let percent = 0;

    if (startDate && endDate && endDate > startDate) {
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const spentDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
      percent = Number(((spentDays / totalDays) * 100).toFixed(2));
      if (now > endDate) percent = 100;
      if (now < startDate) percent = 0;
    }

    res.json({ project, progresses: project.progresses, percent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project" });
  }
});

router.post(
  "/:projectId/progress",
  authorize(["engineer", "contractor", "admin"]),
  upload.array("image", 3),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const progress = await Progress.create({
        task: req.body.task,
        initial_date: req.body.initial_date,
        final_date: req.body.final_date,
        percentage: req.body.percentage,
        completed: req.body.completed === "true" || req.body.completed === true || req.body.completed === "on",
        description: req.body.description,
        image: (req.files || []).map((file) => ({
          fileName: file.filename,
          url: file.path,
        })),
      });

      project.progresses.push(progress._id);
      await project.save();

      res.status(201).json({ progress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding progress" });
    }
  }
);

router.get("/:projectId/progress/:progressId", async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.progressId);
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.json({ project, progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching progress" });
  }
});

router.put(
  "/:projectId/progress/:progressId",
  authorize(["engineer", "contractor", "admin"]),
  upload.array("image", 3),
  async (req, res) => {
    try {
      const progress = await Progress.findById(req.params.progressId);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }

      const removedImages = Array.isArray(req.body.removedImages)
        ? req.body.removedImages
        : req.body.removedImages
          ? [req.body.removedImages]
          : [];

      if (removedImages.length > 0) {
        progress.image = progress.image.filter((img, index) => !removedImages.includes(String(index)));
      }

      if (req.files && req.files.length > 0) {
        progress.image = progress.image.concat(
          req.files.map((file) => ({
            fileName: file.filename,
            url: file.path,
          }))
        );
      }

      progress.task = req.body.task ?? progress.task;
      progress.initial_date = req.body.initial_date ? new Date(req.body.initial_date) : progress.initial_date;
      progress.final_date = req.body.final_date ? new Date(req.body.final_date) : progress.final_date;
      progress.percentage = req.body.percentage ?? progress.percentage;
      if (req.body.completed !== undefined) {
        progress.completed = req.body.completed === "true" || req.body.completed === true || req.body.completed === "on";
      }
      progress.description = req.body.description ?? progress.description;

      await progress.save();
      res.json({ progress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating progress" });
    }
  }
);

router.get("/:projectId/comments", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("comments");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project, comments: project.comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

router.post("/:projectId/comments", authorize(["engineer", "contractor", "senior-manager", "manager", "admin"]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const comment = await Comment.create({
      comment: req.body.comment,
      user_name: req.user.name,
      user_role: req.user.role,
    });

    project.comments.push(comment._id);
    await project.save();

    const io = req.app.get("io");
    io.to(req.params.projectId).emit("newComment", {
      comment: comment.comment,
      date: comment.date,
      user_name: comment.user_name,
      user_role: comment.user_role,
      projectId: req.params.projectId,
    });

    res.status(201).json({ comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

router.get("/:projectId/documents", authorize(["guest", "engineer", "contractor", "manager", "senior-manager", "admin"]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      project,
      drawings: project.drawings || [],
      tenders: project.tenders || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

router.post("/:projectId/documents/drawing", authorize(["engineer", "contractor", "senior-manager", "manager", "admin"]), async (req, res) => {
  try {
    const { title, link } = req.body;
    if (!title || !link) {
      return res.status(400).json({ message: "Title and link are required" });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.drawings.push({
      title,
      link,
      date: new Date(),
      user_id: req.user._id,
      user_name: req.user.name,
      image: "/images/default-drawing.png",
    });

    await project.save();
    res.status(201).json({ drawing: project.drawings.at(-1) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload drawing" });
  }
});

router.post("/:projectId/documents/tender", authorize(["engineer", "contractor", "senior-manager", "manager", "admin"]), async (req, res) => {
  try {
    const { title, link } = req.body;
    if (!title || !link) {
      return res.status(400).json({ message: "Title and link are required" });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.tenders.push({
      title,
      link,
      date: new Date(),
      user_id: req.user._id,
      user_name: req.user.name,
      image: "/images/default-tender.png",
    });

    await project.save();
    res.status(201).json({ tender: project.tenders.at(-1) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload tender" });
  }
});

module.exports = router;
