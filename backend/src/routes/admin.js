const express = require("express");
const User = require("../models/userSchema");
const { allowRoles } = require("../middleware/auth");
const router = express.Router();
router.get("/users", ...allowRoles("admin"), async (req, res, next) => { try { res.json({ users: await User.find().select("-password").sort({ approved: 1, name: 1 }) }); } catch (error) { next(error); } });
router.patch("/users/:userId/approval", ...allowRoles("admin"), async (req, res, next) => { try { const user = await User.findByIdAndUpdate(req.params.userId, { approved: Boolean(req.body.approved) }, { new: true }).select("-password"); if (!user) return res.status(404).json({ message: "User not found." }); res.json({ user }); } catch (error) { next(error); } });
router.delete("/users/:userId", ...allowRoles("admin"), async (req, res, next) => { try { const user = await User.findByIdAndDelete(req.params.userId); if (!user) return res.status(404).json({ message: "User not found." }); res.status(204).send(); } catch (error) { next(error); } });
module.exports = router;
