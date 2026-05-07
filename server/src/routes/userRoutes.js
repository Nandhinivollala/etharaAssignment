const express = require("express");
const { getUsers, updateUserStatus } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, authorizeRoles("Admin"));

router.get("/", getUsers);
router.patch("/:id/status", updateUserStatus);

module.exports = router;
