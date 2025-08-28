const { User } = require("../models");
const { Op } = require("sequelize");

// Get all users with role-based filtering
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const currentUser = req.user;

    // Build where clause based on user role
    let whereClause = {};

    if (currentUser.roles === "admin") {
      // Admin can only see users with role 'user' and 'admin'
      whereClause.roles = { [Op.in]: ["user", "admin"] };
    } else if (currentUser.roles === "super_admin") {
      // Super admin can see all users
      // No additional filtering needed
    } else {
      // Regular users cannot access this endpoint
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or Super Admin role required.",
      });
    }

    // Add role filter if specified
    if (role) {
      if (currentUser.roles === "admin" && role === "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Admin cannot filter by super_admin role.",
        });
      }
      whereClause.roles = role;
    }

    // Add search filter if specified
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { displayName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Check if user can access this user
    if (currentUser.roles === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or Super Admin role required.",
      });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin cannot view super_admin users
    if (currentUser.roles === "admin" && user.roles === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot view super_admin users.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user;

    // Check if user can update this user
    const isSelfUpdate = currentUser.id === id;
    const isAdmin =
      currentUser.roles === "admin" || currentUser.roles === "super_admin";

    if (!isSelfUpdate && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only update your own profile or need Admin/Super Admin role.",
      });
    }

    // If self-update, restrict what can be changed
    if (isSelfUpdate) {
      // Users can only update their own profile fields, not roles or account status
      delete updateData.roles;
      delete updateData.isActive;
      delete updateData.isVerified;
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin cannot update super_admin users
    if (currentUser.roles === "admin" && user.roles === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot modify super_admin users.",
      });
    }

    // Admin cannot set role to super_admin
    if (currentUser.roles === "admin" && updateData.roles === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot set role to super_admin.",
      });
    }

    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData.googleId;

    await user.update(updateData);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Check if user can delete this user
    if (currentUser.roles === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or Super Admin role required.",
      });
    }

    // Prevent self-deletion
    if (currentUser.id === id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete yourself.",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin cannot delete super_admin users
    if (currentUser.roles === "admin" && user.roles === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot delete super_admin users.",
      });
    }

    // Check if user has active content (submissions, portfolios, etc.)
    // This is a basic check - you might want to add more comprehensive checks
    const hasActiveContent = false; // Placeholder for actual content checks

    if (hasActiveContent) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active content.",
      });
    }

    await user.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
