const axios = require("axios");
const crypto = require("crypto");
const { User } = require("../models");
const { generateToken } = require("../services/authService");
const { loadConfig } = require("../config/configLoader");

// Load OAuth configuration
const loadOAuthConfig = () => {
  const config = loadConfig();
  const oauthConfig = config.auth.oauth;

  // Extract URLs from the nested structure
  return {
    client_id: oauthConfig.client_id,
    secret: oauthConfig.secret,
    redirect_url: oauthConfig.redirect_url,
    userinfo_url: oauthConfig.userinfo_url,
    scopes: oauthConfig.scopes,
    auth_url: oauthConfig.server_token_endpoint_url.auth_url,
    token_url: oauthConfig.server_token_endpoint_url.token_url,
    device_auth_url: oauthConfig.server_token_endpoint_url.device_auth_url,
  };
};

// Load JWT configuration
const loadJWTConfig = () => {
  const config = loadConfig();
  return config.auth.jwt;
};

// Load RBAC configuration
const loadRBACConfig = () => {
  const config = loadConfig();
  return config.auth.rbac;
};

// Generate random state for CSRF protection
const generateState = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate random nonce for replay protection
const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Verify state parameter
const verifyState = (receivedState, storedState) => {
  return receivedState === storedState;
};

// Validate user role
const validateRole = (role) => {
  const rbacConfig = loadRBACConfig();
  const validRoles = Object.keys(rbacConfig.roles);
  return validRoles.includes(role);
};

// Generate Google OAuth authorization URL
const generateAuthUrl = (state, nonce, requestedRole = null) => {
  try {
    const oauthConfig = loadOAuthConfig();

    const params = new URLSearchParams({
      client_id: oauthConfig.client_id,
      redirect_uri: oauthConfig.redirect_url,
      response_type: "code",
      scope: oauthConfig.scopes.join(" "),
      state: state,
      nonce: nonce,
      access_type: "offline",
      prompt: "consent",
    });

    // Add role parameter if specified
    if (requestedRole && validateRole(requestedRole)) {
      params.append("role", requestedRole);
    }

    return `${oauthConfig.auth_url}?${params.toString()}`;
  } catch (error) {
    console.error("Error generating auth URL:", error);
    throw new Error("Failed to generate authorization URL");
  }
};

// Exchange authorization code for access token
const exchangeCodeForToken = async (code) => {
  try {
    const oauthConfig = loadOAuthConfig();

    const tokenResponse = await axios.post(oauthConfig.token_url, {
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.secret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: oauthConfig.redirect_url,
    });

    return tokenResponse.data;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw new Error("Failed to exchange authorization code for token");
  }
};

// Get user information from Google
const getUserInfo = async (accessToken) => {
  try {
    const oauthConfig = loadOAuthConfig();

    const userInfoResponse = await axios.get(oauthConfig.userinfo_url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return userInfoResponse.data;
  } catch (error) {
    console.error("Error getting user info:", error);
    throw new Error("Failed to get user information from Google");
  }
};

// Find or create user from OAuth data
const findOrCreateUser = async (
  googleUserInfo,
  requestedRole = null,
  adminUser = null
) => {
  try {
    // Check if user already exists by email
    let user = await User.findOne({
      where: { email: googleUserInfo.email },
    });

    if (user) {
      // Update last login and OAuth info
      await user.update({
        lastLogin: new Date(),
        googleId: googleUserInfo.sub,
        profileImageURL: googleUserInfo.picture,
      });
    } else {
      // Determine the role for new user
      let userRole = "user"; // Default role

      // If role is requested and admin is making the request
      if (requestedRole && adminUser) {
        const adminRoles = Array.isArray(adminUser.roles)
          ? adminUser.roles
          : [adminUser.roles];

        // Check if admin can assign this role
        if (adminRoles.includes("super_admin")) {
          // Super admin can assign any role
          if (validateRole(requestedRole)) {
            userRole = requestedRole;
          }
        } else if (adminRoles.includes("admin")) {
          // Regular admin can only assign "user" role
          if (requestedRole === "user") {
            userRole = requestedRole;
          }
        }
      }

      // Create new user
      user = await User.create({
        email: googleUserInfo.email,
        username: generateUsername(googleUserInfo.email),
        displayName: googleUserInfo.name,
        profileImageURL: googleUserInfo.picture,
        googleId: googleUserInfo.sub,
        isVerified: true,
        isActive: true,
        roles: userRole,
        password: null, // OAuth users don't need password
      });
    }

    return user;
  } catch (error) {
    console.error("Error finding or creating user:", error);
    throw new Error("Failed to process user authentication");
  }
};

// Generate unique username from email
const generateUsername = (email) => {
  const baseUsername = email.split("@")[0];
  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}_${timestamp}`;
};

// Handle OAuth callback
const handleOAuthCallback = async (req, res) => {
  try {
    const { code, state, error, role } = req.query;

    if (error) {
      // Redirect to frontend with error
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback?error=${encodeURIComponent("Missing authorization code or state")}`
      );
    }

    // Verify state parameter (should be stored in session)
    const storedState = req.session.oauthState;
    if (!storedState || !verifyState(state, storedState)) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback?error=${encodeURIComponent("Invalid state parameter")}`
      );
    }

    // Validate role if provided
    if (role && !validateRole(role)) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback?error=${encodeURIComponent("Invalid role specified")}`
      );
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code);

    // Get user information
    const userInfo = await getUserInfo(tokenData.access_token);

    // Find or create user with role (if admin is making the request)
    const adminUser = req.session.adminUser || null; // Admin user from session if available
    const user = await findOrCreateUser(userInfo, role, adminUser);

    // Generate JWT token
    const jwtConfig = loadJWTConfig();
    const token = generateToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      },
      jwtConfig.access_token_validity
    );

    // Clear OAuth state from session
    delete req.session.oauthState;
    delete req.session.adminUser;

    // Redirect to frontend with success and token
    const successParams = new URLSearchParams({
      success: "true",
      token: token,
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: Array.isArray(user.roles) ? user.roles.join(",") : user.roles,
      displayName: user.displayName || "",
      profileImageURL: user.profileImageURL || "",
    });

    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback?${successParams.toString()}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);

    const errorParams = new URLSearchParams({
      error: "OAuth authentication failed",
      details: error.message,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/oauth/callback?${errorParams.toString()}`
    );
  }
};

// Initiate OAuth flow with optional role specification
const initiateOAuth = (req, res) => {
  try {
    const { role } = req.query;
    const adminUser = req.user; // Current authenticated user (if any)

    // Validate role if provided
    if (role && !validateRole(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
        error: "INVALID_ROLE",
      });
    }

    // Check if admin can assign the requested role
    if (role && adminUser) {
      const adminRoles = Array.isArray(adminUser.roles)
        ? adminUser.roles
        : [adminUser.roles];

      if (adminRoles.includes("super_admin")) {
        // Super admin can assign any role
      } else if (adminRoles.includes("admin")) {
        // Regular admin can only assign "user" role
        if (role !== "user") {
          return res.status(403).json({
            success: false,
            message: "You can only assign 'user' role",
            error: "INSUFFICIENT_PERMISSIONS",
          });
        }
      } else {
        // Regular users cannot assign roles
        return res.status(403).json({
          success: false,
          message: "You cannot assign roles",
          error: "INSUFFICIENT_PERMISSIONS",
        });
      }
    }

    // Generate state and nonce for security
    const state = generateState();
    const nonce = generateNonce();

    // Store state in session for verification
    req.session.oauthState = state;

    // Store admin user info if role assignment is requested
    if (role && adminUser) {
      req.session.adminUser = adminUser;
    }

    // Generate authorization URL
    const authUrl = generateAuthUrl(state, nonce, role);

    res.json({
      success: true,
      data: {
        authUrl: authUrl,
        state: state,
        role: role || "user", // Default role
      },
    });
  } catch (error) {
    console.error("Error initiating OAuth:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate OAuth flow",
      error: error.message,
    });
  }
};

// Handle OAuth logout
const handleLogout = (req, res) => {
  try {
    // Clear OAuth state from session
    if (req.session) {
      delete req.session.oauthState;
      req.session.destroy();
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// Middleware to check if OAuth is enabled
const isOAuthEnabled = () => {
  try {
    const oauthConfig = loadOAuthConfig();
    return oauthConfig && oauthConfig.client_id && oauthConfig.secret;
  } catch (error) {
    return false;
  }
};

// Get OAuth configuration status
const getOAuthStatus = () => {
  try {
    const oauthConfig = loadOAuthConfig();
    return {
      enabled: !!(oauthConfig && oauthConfig.client_id && oauthConfig.secret),
      clientId: oauthConfig?.client_id ? "configured" : "missing",
      redirectUrl: oauthConfig?.redirect_url || "not configured",
      scopes: oauthConfig?.scopes || [],
    };
  } catch (error) {
    return {
      enabled: false,
      error: error.message,
    };
  }
};

module.exports = {
  loadOAuthConfig,
  generateAuthUrl,
  exchangeCodeForToken,
  getUserInfo,
  findOrCreateUser,
  generateUsername,
  verifyState,
  generateState,
  generateNonce,
  initiateOAuth,
  handleOAuthCallback,
  handleLogout,
  isOAuthEnabled,
  getOAuthStatus,
};
