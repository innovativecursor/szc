const { User } = require("../models");
const { Op } = require("sequelize");

/**
 * Get all pending admin approvals (super admin only)
 */
const getPendingAdminApprovals = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.roles !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can access admin approvals",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Find all unverified admin users
    const pendingAdmins = await User.findAll({
      where: {
        roles: { [Op.in]: ["admin", "super_admin"] },
        isVerified: false,
        isActive: true,
      },
      attributes: [
        "id",
        "username",
        "email",
        "firstName",
        "lastName",
        "displayName",
        "roles",
        "createdAt",
        "lastLogin",
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      message: "Pending admin approvals retrieved successfully",
      data: {
        pendingAdmins,
        count: pendingAdmins.length,
      },
    });
  } catch (error) {
    console.error("Error getting pending admin approvals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve pending admin approvals",
      error: error.message,
    });
  }
};

/**
 * Approve admin user (super admin only)
 */
const approveAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { approved, reason } = req.body;

    // Check if user is super admin
    if (req.user.roles !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can approve admin users",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Find the admin user
    const adminUser = await User.findOne({
      where: {
        id: adminId,
        roles: { [Op.in]: ["admin", "super_admin"] },
      },
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
        error: "ADMIN_NOT_FOUND",
      });
    }

    if (approved) {
      // Approve the admin
      await adminUser.update({
        isVerified: true,
        isActive: true,
      });

      res.json({
        success: true,
        message: "Admin user approved successfully",
        data: {
          admin: {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            isVerified: adminUser.isVerified,
            isActive: adminUser.isActive,
          },
        },
      });
    } else {
      // Reject the admin
      await adminUser.update({
        isActive: false,
      });

      res.json({
        success: true,
        message: "Admin user rejected",
        data: {
          admin: {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            isVerified: adminUser.isVerified,
            isActive: adminUser.isActive,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error approving admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve admin user",
      error: error.message,
    });
  }
};

/**
 * Get all admin users (super admin only)
 */
const getAllAdmins = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.roles !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can view all admins",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Find all admin users
    const admins = await User.findAll({
      where: {
        roles: { [Op.in]: ["admin", "super_admin"] },
      },
      attributes: [
        "id",
        "username",
        "email",
        "firstName",
        "lastName",
        "displayName",
        "roles",
        "isVerified",
        "isActive",
        "createdAt",
        "lastLogin",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "Admin users retrieved successfully",
      data: {
        admins,
        count: admins.length,
      },
    });
  } catch (error) {
    console.error("Error getting admin users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin users",
      error: error.message,
    });
  }
};

/**
 * Deactivate admin user (super admin only)
 */
const deactivateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Check if user is super admin
    if (req.user.roles !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can deactivate admin users",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Find the admin user
    const adminUser = await User.findOne({
      where: {
        id: adminId,
        roles: { [Op.in]: ["admin", "super_admin"] },
      },
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
        error: "ADMIN_NOT_FOUND",
      });
    }

    // Deactivate the admin
    await adminUser.update({
      isActive: false,
      isVerified: false,
    });

    res.json({
      success: true,
      message: "Admin user deactivated successfully",
      data: {
        admin: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          isVerified: adminUser.isVerified,
          isActive: adminUser.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Error deactivating admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate admin user",
      error: error.message,
    });
  }
};

module.exports = {
  getPendingAdminApprovals,
  approveAdmin,
  getAllAdmins,
  deactivateAdmin,
};
