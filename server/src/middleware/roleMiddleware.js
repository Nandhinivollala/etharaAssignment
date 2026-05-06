const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      next(new Error("Forbidden: insufficient role"));
      return;
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
