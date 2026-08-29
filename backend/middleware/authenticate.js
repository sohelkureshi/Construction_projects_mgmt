const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const COOKIE_NAME = "token";

async function resolveUserFromRequest(req) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch (error) {
    return null;
  }
}

async function attachUser(req, res, next) {
  try {
    const user = await resolveUserFromRequest(req);
    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}

module.exports = {
  COOKIE_NAME,
  attachUser,
  requireAuth,
  resolveUserFromRequest,
};
