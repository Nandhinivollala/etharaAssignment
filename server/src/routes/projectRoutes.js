const express = require("express");
const {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getProjects)
  .post(authorizeRoles("Admin"), createProject);

router
  .route("/:id")
  .get(getProjectById)
  .put(authorizeRoles("Admin"), updateProject)
  .delete(authorizeRoles("Admin"), deleteProject);

module.exports = router;
