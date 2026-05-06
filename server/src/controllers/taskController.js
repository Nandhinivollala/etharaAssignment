const Project = require("../models/Project");
const Task = require("../models/Task");

const populateTask = (query) =>
  query
    .populate("project", "name status")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

const getTasks = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "Admin"
        ? {}
        : { assignedTo: req.user._id };

    if (req.query.project) {
      filter.project = req.query.project;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const tasks = await populateTask(
      Task.find(filter).sort({ dueDate: 1, createdAt: -1 })
    );

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const canView =
      req.user.role === "Admin" ||
      task.assignedTo._id.toString() === req.user._id.toString();

    if (!canView) {
      res.status(403);
      throw new Error("Forbidden: task access denied");
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, status, dueDate } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      res.status(400);
      throw new Error("Title, project, assigned member, and due date are required");
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
      res.status(404);
      throw new Error("Project not found");
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      status,
      dueDate,
      createdBy: req.user._id
    });

    const populatedTask = await populateTask(Task.findById(task._id));

    res.status(201).json({
      success: true,
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, status, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const isAssignedMember = task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role !== "Admin" && !isAssignedMember) {
      res.status(403);
      throw new Error("Forbidden: task access denied");
    }

    if (req.user.role === "Admin") {
      task.title = title ?? task.title;
      task.description = description ?? task.description;
      task.project = project ?? task.project;
      task.assignedTo = assignedTo ?? task.assignedTo;
      task.dueDate = dueDate ?? task.dueDate;
    }

    if (status) {
      task.status = status;
    }

    await task.save();

    const populatedTask = await populateTask(Task.findById(task._id));

    res.json({
      success: true,
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: "Task deleted"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
