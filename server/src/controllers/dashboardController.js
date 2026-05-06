const Project = require("../models/Project");
const Task = require("../models/Task");

const getDashboardSummary = async (req, res, next) => {
  try {
    const projectFilter =
      req.user.role === "Admin"
        ? {}
        : { teamMembers: req.user._id };
    const taskFilter =
      req.user.role === "Admin"
        ? {}
        : { assignedTo: req.user._id };

    const now = new Date();

    const [
      totalProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "Todo" }),
      Task.countDocuments({ ...taskFilter, status: "In Progress" }),
      Task.countDocuments({ ...taskFilter, status: "Done" }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: "Done" },
        dueDate: { $lt: now }
      })
    ]);

    res.json({
      success: true,
      summary: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
