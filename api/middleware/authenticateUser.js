const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { hasPermission, hasRole } = require("./rbac");
const {
  authenticate: basicAuth,
  optionalAuthenticate: optionalBasicAuth,
  apiKeyAuth,
} = require("./basicAuth");
const { generateToken, verifyToken } = require("../services/authService");

/**
 * JWT authentication middleware
 * @returns {Function} Express middleware function
 */
const authenticateJWT = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      // Find user by ID from token
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return null;
      }

      // Check if user is active
      if (!user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      console.error("JWT authentication error:", error);
      return null;
    }
  };
};

/**
 * Basic authentication middleware
 * @returns {Function} Express middleware function
 */
const authenticateBasic = () => {
  return basicAuth();
};

/**
 * API key authentication middleware
 * @returns {Function} Express middleware function
 */
const authenticateApiKey = () => {
  return apiKeyAuth();
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message) => {
  return res.status(401).json({
    success: false,
    message: message,
    error: "UNAUTHORIZED",
  });
};

/**
 * Enhanced authentication middleware with multiple auth methods support
 * @param {Object} options - Authentication options
 * @returns {Function} Express middleware function
 */
const authenticateUser = (options = {}) => {
  const {
    requireVerified = true,
    checkAccountStatus = true,
    logAuthAttempts = true,
  } = options;

  return async (req, res, next) => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return sendUnauthorized(res, "Authorization header required");
      }

      // Check if it's a Bearer token (JWT)
      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);

        try {
          const decoded = verifyToken(token);

          // Find user in database
          const user = await User.findByPk(decoded.id);
          if (!user) {
            return sendUnauthorized(res, "Invalid token");
          }

          // Additional security checks
          // Admin users can bypass verification requirement
          if (
            requireVerified &&
            !user.isVerified &&
            user.roles !== "admin" &&
            user.roles !== "super_admin"
          ) {
            return res.status(403).json({
              success: false,
              message: "Account verification required",
              error: "ACCOUNT_NOT_VERIFIED",
            });
          }

          if (checkAccountStatus && !user.isActive) {
            return res.status(403).json({
              success: false,
              message: "Account is deactivated",
              error: "ACCOUNT_DEACTIVATED",
            });
          }

          // Log authentication attempt if enabled
          if (logAuthAttempts) {
            console.log(
              `Authentication successful for user ${user.id} via JWT`
            );
          }

          // Attach user to request
          req.user = user;
          req.userId = user.id;
          req.authMethod = "jwt";

          return next();
        } catch (jwtError) {
          return sendUnauthorized(res, "Invalid or expired token");
        }
      }

      // If not Bearer token, return unauthorized
      return sendUnauthorized(res, "Bearer token required");
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return sendUnauthorized(res, "Authentication failed");
    }
  };
};

/**
 * Optional authentication middleware (continues without auth if no credentials)
 * @param {Object} options - Authentication options
 * @returns {Function} Express middleware function
 */
const optionalAuthenticate = (options = {}) => {
  const { allowMultipleAuth = true, logAuthAttempts = false } = options;

  return async (req, res, next) => {
    try {
      let authenticatedUser = null;
      let authMethod = null;

      // Try JWT authentication first
      const jwtUser = await authenticateJWT()(req, res, () => {});
      if (jwtUser) {
        authenticatedUser = jwtUser;
        authMethod = "jwt";
      }

      // Try Basic Auth if JWT failed and multiple auth is allowed
      if (!authenticatedUser && allowMultipleAuth) {
        const basicUser = await optionalBasicAuth()(req, res, () => {});
        if (basicUser) {
          authenticatedUser = basicUser;
          authMethod = "basic";
        }
      }

      // Try API Key if other methods failed and multiple auth is allowed
      if (!authenticatedUser && allowMultipleAuth) {
        const apiKeyUser = await authenticateApiKey()(req, res, () => {});
        if (apiKeyUser) {
          authenticatedUser = apiKeyUser;
          authMethod = "api_key";
        }
      }

      // Attach user to request if authentication successful
      if (authenticatedUser) {
        req.user = authenticatedUser;
        req.userId = authenticatedUser.id;
        req.authMethod = authMethod;

        // Log authentication attempt if enabled
        if (logAuthAttempts) {
          console.log(
            `Optional authentication successful for user ${authenticatedUser.id} via ${authMethod}`
          );
        }
      }

      next();
    } catch (error) {
      console.error("Optional authentication middleware error:", error);
      next(); // Continue without authentication
    }
  };
};

/**
 * Role-based access control middleware
 * @param {string|Array} requiredRoles - Required role(s)
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware function
 */
const requireRole = (requiredRoles, options = {}) => {
  const { allowMultipleRoles = true } = options;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendUnauthorized(res, "Authentication required");
      }

      const userRoles = req.user.roles || [];
      const rolesArray = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      if (allowMultipleRoles) {
        // User must have at least one of the required roles
        const hasRequiredRole = rolesArray.some((role) =>
          hasRole(userRoles, role)
        );
        if (!hasRequiredRole) {
          return res.status(403).json({
            success: false,
            message: "Insufficient role permissions",
            error: "INSUFFICIENT_ROLE",
          });
        }
      } else {
        // User must have all required roles
        const hasAllRoles = rolesArray.every((role) =>
          hasRole(userRoles, role)
        );
        if (!hasAllRoles) {
          return res.status(403).json({
            success: false,
            message: "Insufficient role permissions",
            error: "INSUFFICIENT_ROLE",
          });
        }
      }

      next();
    } catch (error) {
      console.error("Role-based access control error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error: "AUTHORIZATION_ERROR",
      });
    }
  };
};

/**
 * Permission-based access control middleware
 * @param {string} resource - Resource to check permissions for
 * @param {string} action - Action to check permissions for
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware function
 */
const requirePermission = (resource, action, options = {}) => {
  const { checkOwnership = false, ownershipField = "userId" } = options;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendUnauthorized(res, "Authentication required");
      }

      const userRoles = req.user.roles || [];
      const hasRequiredPermission = hasPermission(userRoles, resource, action);

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          error: "INSUFFICIENT_PERMISSIONS",
        });
      }

      // Check ownership if required
      if (checkOwnership) {
        const resourceId = req.params.id || req.body.id;
        if (resourceId && req.user.id !== resourceId) {
          return res.status(403).json({
            success: false,
            message: "Access denied - resource ownership required",
            error: "OWNERSHIP_REQUIRED",
          });
        }
      }

      next();
    } catch (error) {
      console.error("Permission-based access control error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error: "AUTHORIZATION_ERROR",
      });
    }
  };
};

/**
 * Super admin access control middleware
 * @returns {Function} Express middleware function
 */
const requireSuperAdmin = () => {
  return requireRole("super_admin");
};

/**
 * Admin access control middleware
 * @returns {Function} Express middleware function
 */
const requireAdmin = () => {
  return requireRole(["admin", "super_admin"]);
};

/**
 * User access control middleware (any authenticated user)
 * @returns {Function} Express middleware function
 */
const requireUser = () => {
  return requireRole(["user", "admin", "super_admin"]);
};

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {string} JWT token
 */

/**
 * Refresh JWT token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New access token
 */
const refreshToken = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    const newAccessToken = generateToken(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      "1h"
    );
    const newRefreshToken = generateToken(
      {
        id: user.id,
        type: "refresh",
      },
      "1h"
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error("Failed to refresh token");
  }
};

/**
 * Validate JWT token without throwing errors
 * @param {string} token - JWT token to validate
 * @returns {Object|null} Decoded token or null if invalid
 */
const validateToken = (token) => {
  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return new Date() > expiration;
};

/**
 * Extract user from request (helper function)
 * @param {Object} req - Express request object
 * @returns {Object|null} User object or null
 */
const getUserFromRequest = (req) => {
  return req.user || null;
};

/**
 * Extract user ID from request (helper function)
 * @param {Object} req - Express request object
 * @returns {string|null} User ID or null
 */
const getUserIdFromRequest = (req) => {
  return req.userId || null;
};

/**
 * Check if user is authenticated (helper function)
 * @param {Object} req - Express request object
 * @returns {boolean} True if authenticated
 */
const isAuthenticated = (req) => {
  return !!(req.user && req.userId);
};

/**
 * Check if user has specific role (helper function)
 * @param {Object} req - Express request object
 * @param {string} role - Role to check
 * @returns {boolean} True if user has role
 */
const userHasRole = (req, role) => {
  if (!req.user || !req.user.roles) return false;
  return req.user.roles.includes(role);
};

/**
 * Check if user has specific permission (helper function)
 * @param {Object} req - Express request object
 * @param {string} resource - Resource to check
 * @param {string} action - Action to check
 * @returns {boolean} True if user has permission
 */
const userHasPermission = (req, resource, action) => {
  if (!req.user || !req.user.roles) return false;
  return hasPermission(req.user.roles, resource, action);
};

module.exports = {
  authenticateUser,
  optionalAuthenticate,
  requireRole,
  requirePermission,
  requireSuperAdmin,
  requireAdmin,
  requireUser,
  generateToken,
  refreshToken,
  verifyToken,
  validateToken,
  getTokenExpiration,
  isTokenExpired,
  getUserFromRequest,
  getUserIdFromRequest,
  isAuthenticated,
  userHasRole,
  userHasPermission,
  sendUnauthorized,
};
