const express = require("express");
const {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTasks)
  .post(authorizeRoles("Admin"), createTask);

router
  .route("/:id")
  .get(getTaskById)
  .put(updateTask)
  .delete(authorizeRoles("Admin"), deleteTask);

module.exports = router;
