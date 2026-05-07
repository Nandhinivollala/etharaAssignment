const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const filter = { role: "Member" };

    if (req.query.active === "true") {
      filter.isActive = true;
    }

    const users = await User.find(filter)
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive boolean value is required");
    }

    if (req.params.id === req.user._id.toString()) {
      res.status(400);
      throw new Error("Admins cannot deactivate their own account");
    }

    const user = await User.findById(req.params.id).select(
      "name email role isActive createdAt"
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserStatus
};
