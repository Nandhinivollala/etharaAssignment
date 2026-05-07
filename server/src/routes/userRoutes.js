const express = require("express");
const { getUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("Admin"), getUsers);

module.exports = router;
