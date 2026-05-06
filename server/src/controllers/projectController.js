const Project = require("../models/Project");

const getProjects = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "Admin"
        ? {}
        : { teamMembers: req.user._id };

    const projects = await Project.find(filter)
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role");

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const canView =
      req.user.role === "Admin" ||
      project.teamMembers.some(
        (member) => member._id.toString() === req.user._id.toString()
      );

    if (!canView) {
      res.status(403);
      throw new Error("Forbidden: project access denied");
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description, status, teamMembers = [] } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Project name is required");
    }

    const project = await Project.create({
      name,
      description,
      status,
      teamMembers,
      createdBy: req.user._id
    });

    const populatedProject = await Project.findById(project._id)
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      project: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, teamMembers } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    project.name = name ?? project.name;
    project.description = description ?? project.description;
    project.status = status ?? project.status;

    if (Array.isArray(teamMembers)) {
      project.teamMembers = teamMembers;
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role");

    res.json({
      success: true,
      project: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: "Project deleted"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
