const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { getJWTConfig } = require("../config/configLoader");
const { hasPermission, hasRole } = require("./rbac");
const {
  authenticate: basicAuth,
  optionalAuthenticate: optionalBasicAuth,
  apiKeyAuth,
} = require("./basicAuth");

// Load JWT configuration
const loadJWTConfig = () => {
  try {
    return getJWTConfig();
  } catch (error) {
    console.error("Error loading JWT config:", error);
    return {
      signing_key: "your-secret-key",
      access_token_validity: "24h",
      refresh_token_validity: "7d",
      issuer: "https://skillzcollab.com",
      audience: "https://skillzcollab.com",
      algorithm: "HS256",
    };
  }
};

/**
 * Enhanced JWT token verification with comprehensive error handling
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const jwtConfig = loadJWTConfig();
    const options = {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithms: [jwtConfig.algorithm],
    };

    return jwt.verify(token, jwtConfig.signing_key, options);
  } catch (error) {
    // Enhanced error handling for different JWT error types
    if (error.name === "TokenExpiredError") {
      throw new Error("TOKEN_EXPIRED");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("INVALID_TOKEN");
    } else if (error.name === "NotBeforeError") {
      throw new Error("TOKEN_NOT_ACTIVE");
    } else if (error.name === "JWTIssuerError") {
      throw new Error("INVALID_ISSUER");
    } else if (error.name === "JWTAudienceError") {
      throw new Error("INVALID_AUDIENCE");
    } else {
      throw new Error("TOKEN_VERIFICATION_FAILED");
    }
  }
};

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
      const user = await User.findByPk(decoded.userId);
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
    allowMultipleAuth = true,
    requireVerified = true,
    checkAccountStatus = true,
    logAuthAttempts = true,
  } = options;

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
        const basicUser = await authenticateBasic()(req, res, () => {});
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

      if (!authenticatedUser) {
        return sendUnauthorized(res, "Authentication required");
      }

      // Additional security checks
      if (requireVerified && !authenticatedUser.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Account verification required",
          error: "ACCOUNT_NOT_VERIFIED",
        });
      }

      if (checkAccountStatus && !authenticatedUser.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated",
          error: "ACCOUNT_DEACTIVATED",
        });
      }

      // Log authentication attempt if enabled
      if (logAuthAttempts) {
        console.log(
          `Authentication successful for user ${authenticatedUser.id} via ${authMethod}`
        );
      }

      // Attach user to request
      req.user = authenticatedUser;
      req.userId = authenticatedUser.id;
      req.authMethod = authMethod;

      next();
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
const generateToken = (user, type = "access") => {
  try {
    const jwtConfig = loadJWTConfig();
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      type: type,
    };

    const expiresIn =
      type === "refresh"
        ? jwtConfig.refresh_token_validity
        : jwtConfig.access_token_validity;

    return jwt.sign(payload, jwtConfig.signing_key, {
      expiresIn: expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithm: jwtConfig.algorithm,
    });
  } catch (error) {
    console.error("Error generating JWT token:", error);
    throw new Error("Failed to generate authentication token");
  }
};

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

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    const newAccessToken = generateToken(user, "access");
    const newRefreshToken = generateToken(user, "refresh");

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
