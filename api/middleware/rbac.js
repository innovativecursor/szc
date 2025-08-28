const { loadConfig } = require("../config/configLoader");

// Load RBAC configuration
const loadRBACConfig = () => {
  const config = loadConfig();
  return config.auth.rbac;
};

// Check if user has permission for a specific resource and action
const hasPermission = (userRoles, resource, action) => {
  try {
    const rbacConfig = loadRBACConfig();

    // Check root permissions first
    if (rbacConfig.roles.root && rbacConfig.roles.root.includes("*:*")) {
      return true;
    }

    // Check global permissions
    if (
      rbacConfig.roles.global_write &&
      rbacConfig.roles.global_write.includes("*:write")
    ) {
      if (
        action === "write" ||
        action === "create" ||
        action === "update" ||
        action === "delete"
      ) {
        return true;
      }
    }

    if (
      rbacConfig.roles.global_read &&
      rbacConfig.roles.global_read.includes("*:read")
    ) {
      if (action === "read" || action === "get" || action === "list") {
        return true;
      }
    }

    // Check role-based permissions
    for (const role of userRoles) {
      if (rbacConfig.roles[role]) {
        const roleConfig = rbacConfig.roles[role];

        // Check direct permissions
        if (roleConfig.permissions) {
          for (const permission of roleConfig.permissions) {
            if (checkPermissionString(permission, resource, action)) {
              return true;
            }
          }
        }

        // Check inherited permissions
        if (roleConfig.inherits) {
          for (const inheritedRole of roleConfig.inherits) {
            if (hasPermission([inheritedRole], resource, action)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking RBAC permissions:", error);
    return false;
  }
};

// Check permission string (e.g., "user:read", "brief:write")
const checkPermissionString = (permission, resource, action) => {
  if (permission === "*:*") return true;

  const [permResource, permAction] = permission.split(":");

  if (permResource === "*" || permResource === resource) {
    if (permAction === "*" || permAction === action) {
      return true;
    }

    // Check action aliases
    const rbacConfig = loadRBACConfig();
    if (rbacConfig.action_aliases && rbacConfig.action_aliases[permAction]) {
      return rbacConfig.action_aliases[permAction].includes(action);
    }
  }

  return false;
};

// Check if user has role
const hasRole = (userRoles, requiredRole) => {
  return userRoles.includes(requiredRole);
};

// Check if user has any of the required roles
const hasAnyRole = (userRoles, requiredRoles) => {
  return requiredRoles.some((role) => userRoles.includes(role));
};

// Check if user has all required roles
const hasAllRoles = (userRoles, requiredRoles) => {
  return requiredRoles.every((role) => userRoles.includes(role));
};

// Get user permissions for a specific resource
const getUserPermissions = (userRoles, resource) => {
  const permissions = new Set();

  for (const role of userRoles) {
    const rbacConfig = loadRBACConfig();
    if (rbacConfig.roles[role]) {
      const roleConfig = rbacConfig.roles[role];

      if (roleConfig.permissions) {
        for (const permission of roleConfig.permissions) {
          const [permResource, permAction] = permission.split(":");
          if (permResource === resource || permResource === "*") {
            permissions.add(permAction);
          }
        }
      }
    }
  }

  return Array.from(permissions);
};

// Get role permissions
const getRolePermissions = (role) => {
  const rbacConfig = loadRBACConfig();
  return rbacConfig.roles[role]?.permissions || [];
};

// Middleware to require specific permission
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles
        : [req.user.roles];

      if (hasPermission(userRoles, resource, action)) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${resource}:${action}`,
        });
      }
    } catch (error) {
      console.error("Error in requirePermission middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Middleware to require ownership
const requireOwnership = (resourceType, resourceIdField = "id") => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const resourceId = req.params[resourceIdField];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID required",
        });
      }

      // Check if user has admin or super_admin role (bypass ownership check)
      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles
        : [req.user.roles];
      if (hasAnyRole(userRoles, ["admin", "super_admin"])) {
        return next();
      }

      // Check ownership
      const resource = await getResourceById(resourceType, resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      if (
        resource.userId === req.user.id ||
        resource.creatorId === req.user.id
      ) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only modify your own resources.",
        });
      }
    } catch (error) {
      console.error("Error in requireOwnership middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Middleware to require business hours (for admin actions)
const requireBusinessHours = () => {
  return (req, res, next) => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Check if it's a weekday (Monday = 1, Friday = 5)
      if (day === 0 || day === 6) {
        return res.status(403).json({
          success: false,
          message:
            "This action is only available during business hours (Monday-Friday, 9 AM - 6 PM)",
        });
      }

      // Check if it's between 9 AM and 6 PM
      if (hour < 9 || hour >= 18) {
        return res.status(403).json({
          success: false,
          message:
            "This action is only available during business hours (Monday-Friday, 9 AM - 6 PM)",
        });
      }

      next();
    } catch (error) {
      console.error("Error in requireBusinessHours middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Middleware to require admin role for admin-only resources
const requireAdminAccess = () => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles
        : [req.user.roles];

      // Check if user has admin or super_admin role
      if (hasAnyRole(userRoles, ["admin", "super_admin"])) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Admin access required for this resource",
        });
      }
    } catch (error) {
      console.error("Error in requireAdminAccess middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Middleware to require user role for user-only resources
const requireUserAccess = () => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles
        : [req.user.roles];

      // Any authenticated user can access user resources
      if (hasAnyRole(userRoles, ["user", "admin", "super_admin"])) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "User access required for this resource",
        });
      }
    } catch (error) {
      console.error("Error in requireUserAccess middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Middleware to check if user can read a resource (for briefs, tags, brands)
const requireReadAccess = () => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRoles = Array.isArray(req.user.roles)
        ? req.user.roles
        : [req.user.roles];

      // Any authenticated user can read these resources
      if (hasAnyRole(userRoles, ["user", "admin", "super_admin"])) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Authentication required to view this resource",
        });
      }
    } catch (error) {
      console.error("Error in requireReadAccess middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Helper function to get resource by ID (placeholder - implement based on your models)
const getResourceById = async (resourceType, resourceId) => {
  // This is a placeholder. You should implement this based on your actual models
  // For example:
  // const { User, Brief, Tag } = require('../models');
  // switch (resourceType) {
  //   case 'user': return await User.findByPk(resourceId);
  //   case 'brief': return await Brief.findByPk(resourceId);
  //   case 'tag': return await Tag.findByPk(resourceId);
  //   default: return null;
  // }

  console.warn(
    `getResourceById not implemented for resource type: ${resourceType}`
  );
  return null;
};

// Check if user can perform action on resource
const canPerformAction = (user, resource, action) => {
  if (!user || !user.roles) return false;

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
  return hasPermission(userRoles, resource, action);
};

// Get user's effective permissions
const getEffectivePermissions = (user) => {
  if (!user || !user.roles) return [];

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
  const permissions = new Set();

  for (const role of userRoles) {
    const rolePermissions = getRolePermissions(role);
    rolePermissions.forEach((permission) => permissions.add(permission));
  }

  return Array.from(permissions);
};

module.exports = {
  hasPermission,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getUserPermissions,
  getRolePermissions,
  requirePermission,
  requireOwnership,
  requireBusinessHours,
  requireAdminAccess,
  requireUserAccess,
  requireReadAccess,
  canPerformAction,
  getEffectivePermissions,
  checkPermissionString,
};
