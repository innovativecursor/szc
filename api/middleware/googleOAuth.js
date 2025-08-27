const axios = require("axios");
const crypto = require("crypto");
const { User } = require("../models");
const { generateToken } = require("../services/authService");
const { loadConfig } = require("../config/configLoader");

// Load OAuth configuration
const loadOAuthConfig = () => {
  const config = loadConfig();
  return config.auth.oauth;
};

// Load JWT configuration
const loadJWTConfig = () => {
  const config = loadConfig();
  return config.auth.jwt;
};

// Generate OAuth state parameter for CSRF protection
const generateState = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate OAuth nonce for replay attack protection
const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Verify OAuth state parameter
const verifyState = (receivedState, storedState) => {
  return receivedState === storedState;
};

// Generate Google OAuth authorization URL
const generateAuthUrl = (state, nonce) => {
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
const findOrCreateUser = async (googleUserInfo) => {
  try {
    // Check if user already exists by email
    let user = await User.findOne({
      where: { email: googleUserInfo.email },
    });

    if (user) {
      // Update last login and OAuth info
      await user.update({
        lastLoginAt: new Date(),
        googleId: googleUserInfo.sub,
        profileImageURL: googleUserInfo.picture,
      });
    } else {
      // Create new user
      user = await User.create({
        email: googleUserInfo.email,
        username: generateUsername(googleUserInfo.email),
        displayName: googleUserInfo.name,
        profileImageURL: googleUserInfo.picture,
        googleId: googleUserInfo.sub,
        isVerified: true,
        isActive: true,
        roles: "user",
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
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: "OAuth authorization failed",
        error: error,
      });
    }

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing authorization code or state",
      });
    }

    // Verify state parameter (should be stored in session)
    const storedState = req.session.oauthState;
    if (!storedState || !verifyState(state, storedState)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state parameter",
      });
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code);

    // Get user information
    const userInfo = await getUserInfo(tokenData.access_token);

    // Find or create user
    const user = await findOrCreateUser(userInfo);

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

    // Return success response
    res.json({
      success: true,
      message: "OAuth authentication successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          profileImageURL: user.profileImageURL,
          roles: user.roles,
        },
        token: token,
        expiresAt:
          Date.now() + parseInt(jwtConfig.access_token_validity) * 1000,
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({
      success: false,
      message: "OAuth authentication failed",
      error: error.message,
    });
  }
};

// Initiate OAuth flow
const initiateOAuth = (req, res) => {
  try {
    // Generate state and nonce for security
    const state = generateState();
    const nonce = generateNonce();

    // Store state in session for verification
    req.session.oauthState = state;

    // Generate authorization URL
    const authUrl = generateAuthUrl(state, nonce);

    res.json({
      success: true,
      data: {
        authUrl: authUrl,
        state: state,
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
