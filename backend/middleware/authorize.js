const { requireAuth } = require("./authenticate");

const authorize = (allowedRoles = []) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!roles.includes(req.user.role) || !req.user.approved) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    });
  };
};

module.exports = authorize;
