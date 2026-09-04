const express = require("express");
const multer = require("multer");
const { storage } = require("../config");
const Project = require("../models/projectSchema");
const Progress = require("../models/progressSchema");
const Bill = require("../models/billSchema");
const Comment = require("../models/commentSchema");
const { authenticate, allowRoles } = require("../middleware/auth");
const { serializeProject } = require("../utils/project-status");

const router = express.Router();
const upload = multer({ storage, limits: { files: 3, fileSize: 5 * 1024 * 1024 } });
const managers = ["manager", "contractor", "admin"];
const contributors = ["engineer", "contractor", "senior-manager", "manager", "admin"];
const progressEditors = ["engineer", "contractor", "admin"];
const projectFields = ["title", "supervisor", "company", "overview", "location", "duration", "status", "startDate", "expectedDate"];
const pick = (body, fields) => Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));

router.get("/", authenticate, async (req, res, next) => {
  try { const projects = await Project.find().sort({ startDate: 1 }); res.json({ projects: projects.map(serializeProject) }); } catch (error) { next(error); }
});
router.post("/", ...allowRoles(...managers), async (req, res, next) => {
  try { res.status(201).json({ project: await Project.create(pick(req.body, projectFields)) }); } catch (error) { next(error); }
});
router.get("/:projectId", authenticate, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("progresses bills comments");
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json({ project: serializeProject(project) });
  } catch (error) { next(error); }
});
router.patch("/:projectId", ...allowRoles(...managers), async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.projectId, pick(req.body, projectFields), { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json({ project });
  } catch (error) { next(error); }
});

router.post("/:projectId/comments", ...allowRoles(...contributors), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    const comment = await Comment.create({ comment: req.body.comment, user_name: req.user.name, user_role: req.user.role });
    project.comments.push(comment.id); await project.save();
    req.app.get("io").to(project.id).emit("comment:created", { projectId: project.id, comment });
    res.status(201).json({ comment });
  } catch (error) { next(error); }
});

router.post("/:projectId/documents/:type", ...allowRoles(...contributors), async (req, res, next) => {
  try {
    if (!["drawings", "tenders"].includes(req.params.type)) return res.status(400).json({ message: "Invalid document type." });
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    const { title, link } = req.body;
    if (!title || !link) return res.status(400).json({ message: "Title and link are required." });
    project[req.params.type].push({ title, link, user_id: req.user.id, user_name: req.user.name }); await project.save();
    res.status(201).json({ document: project[req.params.type].at(-1) });
  } catch (error) { next(error); }
});

router.post("/:projectId/progress", ...allowRoles(...progressEditors), upload.array("images", 3), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    const progress = await Progress.create({ ...pick(req.body, ["task", "initial_date", "final_date", "percentage", "completed", "description"]), completed: req.body.completed === "true" || req.body.completed === true, image: (req.files || []).map((file) => ({ fileName: file.filename, url: file.path })) });
    project.progresses.push(progress.id); await project.save(); res.status(201).json({ progress });
  } catch (error) { next(error); }
});

router.post("/:projectId/bills", ...allowRoles("engineer", "contractor", "admin"), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });
    const items = Array.isArray(req.body.items) ? req.body.items : req.body.item_name ? [{ item_id: 1, name: req.body.item_name, quantity: Number(req.body.quantity), units: req.body.units, rate: Number(req.body.rate), amount: Number(req.body.quantity) * Number(req.body.rate) }] : [];
    const total_amount = items.reduce((total, item) => total + Number(item.amount || Number(item.quantity) * Number(item.rate) || 0), 0);
    const bill = await Bill.create({ ...pick(req.body, ["bill_id", "date", "Bill_Name", "previous_amount", "status"]), items, total_amount, created_by: [{ name: req.user.name, role: req.user.role }] });
    project.bills.push(bill.id); await project.save(); res.status(201).json({ bill });
  } catch (error) { next(error); }
});
module.exports = router;
