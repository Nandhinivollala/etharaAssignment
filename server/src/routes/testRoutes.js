const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Public API testing route is working"
  });
});

router.get("/member", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected Member/Admin route is working",
    user: req.user
  });
});

router.get("/admin", protect, authorizeRoles("Admin"), (req, res) => {
  res.json({
    success: true,
    message: "Protected Admin route is working",
    user: req.user
  });
});

module.exports = router;
