const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { getBasicAuthConfig } = require("../config/configLoader");

// Load basic auth configuration
const loadBasicAuthConfig = () => {
  try {
    return getBasicAuthConfig();
  } catch (error) {
    console.error("Error loading basic auth config:", error);
    return { enabled: false };
  }
};

// Check if basic auth is enabled
const isBasicAuthEnabled = () => {
  const config = loadBasicAuthConfig();
  return config.enabled || false;
};

/**
 * Parse Basic Auth header
 * @param {string} authHeader - Authorization header value
 * @returns {Object|null} Parsed credentials or null
 */
const parseAuthHeader = (authHeader) => {
  try {
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return null;
    }

    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const [username, password] = credentials.split(":");

    return { username, password };
  } catch (error) {
    console.error("Error parsing Basic Auth header:", error);
    return null;
  }
};

/**
 * Verify user credentials
 * @param {string} username - Username or email
 * @param {string} password - Password
 * @returns {Object|null} User object if valid, null otherwise
 */
const verifyCredentials = async (username, password) => {
  try {
    if (!username || !password) {
      return null;
    }

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { username: username },
          { email: username },
        ],
      },
    });

    if (!user) {
      return null;
    }

    // Check if user is active
    if (!user.isActive) {
      return null;
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return null;
  }
};

/**
 * Send unauthorized response with WWW-Authenticate header
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message) => {
  res.setHeader("WWW-Authenticate", 'Basic realm="SkillzCollab API"');
  return res.status(401).json({
    success: false,
    message: message,
    error: "UNAUTHORIZED",
  });
};

/**
 * Basic authentication middleware
 * @returns {Function} Express middleware function
 */
const authenticate = () => {
  return async (req, res, next) => {
    try {
      // Check if basic auth is enabled
      if (!isBasicAuthEnabled()) {
        return next();
      }

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return sendUnauthorized(res, "Basic authentication required");
      }

      const credentials = parseAuthHeader(authHeader);
      if (!credentials) {
        return sendUnauthorized(res, "Invalid Basic authentication format");
      }

      const { username, password } = credentials;
      const user = await verifyCredentials(username, password);

      if (!user) {
        return sendUnauthorized(res, "Invalid credentials");
      }

      // Attach user to request
      req.user = user;
      req.userId = user.id;
      req.authMethod = "basic";

      next();
    } catch (error) {
      console.error("Basic auth middleware error:", error);
      return sendUnauthorized(res, "Authentication failed");
    }
  };
};

/**
 * Optional basic authentication middleware
 * @returns {Function} Express middleware function
 */
const optionalAuthenticate = () => {
  return async (req, res, next) => {
    try {
      // Check if basic auth is enabled
      if (!isBasicAuthEnabled()) {
        return next();
      }

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next(); // Continue without authentication
      }

      const credentials = parseAuthHeader(authHeader);
      if (!credentials) {
        return next(); // Continue without authentication
      }

      const { username, password } = credentials;
      const user = await verifyCredentials(username, password);

      if (user) {
        // Attach user to request if authentication successful
        req.user = user;
        req.userId = user.id;
        req.authMethod = "basic";
      }

      next();
    } catch (error) {
      console.error("Optional basic auth middleware error:", error);
      next(); // Continue without authentication
    }
  };
};

/**
 * Middleware for API key authentication (alternative to Basic Auth)
 * @param {string} apiKeyHeader - Header name for API key
 * @returns {Function} Express middleware function
 */
const apiKeyAuth = (apiKeyHeader = "X-API-Key") => {
  return async (req, res, next) => {
    try {
      const apiKey = req.headers[apiKeyHeader.toLowerCase()];

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: "API key required",
          error: "UNAUTHORIZED",
        });
      }

      // Validate API key (implement your own validation logic)
      const isValidApiKey = await validateApiKey(apiKey);

      if (!isValidApiKey) {
        return res.status(401).json({
          success: false,
          message: "Invalid API key",
          error: "UNAUTHORIZED",
        });
      }

      // Attach API key info to request
      req.apiKey = apiKey;
      req.authMethod = "api_key";

      next();
    } catch (error) {
      console.error("API key auth middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Authentication failed",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  };
};

/**
 * Validate API key (placeholder implementation)
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid
 */
const validateApiKey = async (apiKey) => {
  try {
    // Implement your API key validation logic here
    // This could involve checking against a database, configuration, etc.

    // For now, we'll use a simple check against configuration
    const config = loadBasicAuthConfig();
    const validApiKeys = config?.api_keys?.split(",") || [];

    return validApiKeys.includes(apiKey);
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
};

/**
 * Rate limiting middleware for authentication attempts
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware function
 */
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxAttempts = 5, // Maximum attempts per window
    skipSuccessfulRequests = true,
  } = options;

  const attempts = new Map();

  return (req, res, next) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      // Clean up old attempts
      if (attempts.has(clientIp)) {
        const clientAttempts = attempts.get(clientIp);
        clientAttempts.timestamps = clientAttempts.timestamps.filter(
          (timestamp) => now - timestamp < windowMs
        );

        if (clientAttempts.timestamps.length === 0) {
          attempts.delete(clientIp);
        }
      }

      // Check if client has exceeded rate limit
      if (attempts.has(clientIp)) {
        const clientAttempts = attempts.get(clientIp);

        if (clientAttempts.timestamps.length >= maxAttempts) {
          return res.status(429).json({
            success: false,
            message:
              "Too many authentication attempts. Please try again later.",
            error: "RATE_LIMIT_EXCEEDED",
            retryAfter: Math.ceil(windowMs / 1000),
          });
        }
      }

      // Track this attempt
      if (!attempts.has(clientIp)) {
        attempts.set(clientIp, { timestamps: [] });
      }

      attempts.get(clientIp).timestamps.push(now);

      next();
    } catch (error) {
      console.error("Rate limiting middleware error:", error);
      next();
    }
  };
};

/**
 * Enable basic authentication
 */
const enable = () => {
  // This would need to be implemented with a more sophisticated config management
  // For now, it's handled by the config file
  console.log("Basic auth enabled via configuration");
};

/**
 * Disable basic authentication
 */
const disable = () => {
  // This would need to be implemented with a more sophisticated config management
  // For now, it's handled by the config file
  console.log("Basic auth disabled via configuration");
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  apiKeyAuth,
  rateLimit,
  enable,
  disable,
  isBasicAuthEnabled,
  parseAuthHeader,
  verifyCredentials,
  sendUnauthorized,
  validateApiKey,
};
