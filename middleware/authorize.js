// middleware/authorize.js
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Unauthorized" });
      }
      // console.log("User role:", user.role, "Allowed roles:", allowedRoles);
      if (!allowedRoles.includes(user.role) || !user.approved) {
        // console.log("User not authorized or not approved");
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = user;
      next();
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};



module.exports = authorize;
