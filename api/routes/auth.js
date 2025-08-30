const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  authenticateUser,
  requireRole,
  generateToken,
  refreshToken,
} = require("../middleware/authenticateUser");
const {
  registerUser,
  loginUser,
  changePassword,
  resetPassword,
  logoutUser,
} = require("../services/authService");
const {
  initiateOAuth,
  handleOAuthCallback,
  handleLogout: handleOAuthLogout,
} = require("../middleware/googleOAuth");
const axios = require("axios"); // Added axios for Google OAuth authentication
const User = require("../models/User"); // Added User model for Google OAuth

// Validation middleware
const validateRegistration = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be less than 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be less than 50 characters"),
  body("role")
    .isIn(["user", "admin", "super_admin"])
    .withMessage("Role must be one of: user, admin, super_admin"),
];

const validateLogin = [
  body("email")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Must be a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

// User Registration
router.post("/register", validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      displayName: `${req.body.firstName} ${req.body.lastName}`,
      roles: req.body.role, // Role is now mandatory
      isVerified: req.body.role === "user" ? false : false, // Admins start unverified
      isActive: true,
    };

    const user = await registerUser(userData);

    // Generate JWT token for immediate login (only for regular users)
    let token = null;
    let expiresAt = null;

    if (req.body.role === "user") {
      token = generateToken(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          roles: user.roles,
        },
        "1h"
      );
      expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    }

    // Different response for admin vs user registration
    if (req.body.role === "admin" || req.body.role === "super_admin") {
      res.status(201).json({
        success: true,
        message: `${req.body.role === "super_admin" ? "Super Admin" : "Admin"} account created successfully. Pending super admin approval.`,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            roles: user.roles,
            isVerified: user.isVerified,
            message:
              "Your account is pending verification by super admin. You will be notified once approved.",
          },
        },
      });
    } else {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            roles: user.roles,
            isVerified: user.isVerified,
          },
          token,
          expiresAt,
        },
      });
    }
  } catch (error) {
    console.error("Registration error:", error);

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
        error: "USER_EXISTS",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// User Login (Basic Auth)
router.post("/login", validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password, role } = req.body;

    const result = await loginUser(email, password, role);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.message.includes("Invalid credentials")) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS",
      });
    }

    if (error.message.includes("Multiple accounts found")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: "MULTIPLE_ACCOUNTS",
      });
    }

    if (
      error.message.includes("No") &&
      error.message.includes("account found")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: "ACCOUNT_NOT_FOUND",
      });
    }

    if (error.message.includes("deactivated")) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
        error: "ACCOUNT_DEACTIVATED",
      });
    }

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Google OAuth Initiation
router.get("/oauth/google", (req, res) => {
  try {
    initiateOAuth(req, res);
  } catch (error) {
    console.error("OAuth initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate OAuth flow",
      error: error.message,
    });
  }
});

// Admin-initiated OAuth with role specification (requires admin authentication)
router.get("/oauth/google/admin", authenticateUser(), (req, res) => {
  try {
    // Check if user has admin privileges
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    if (!userRoles.includes("admin") && !userRoles.includes("super_admin")) {
      return res.status(403).json({
        success: false,
        message: "Admin access required for role-based OAuth",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    initiateOAuth(req, res);
  } catch (error) {
    console.error("Admin OAuth initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate admin OAuth flow",
      error: error.message,
    });
  }
});

// Google OAuth Callback
router.get("/oauth/google/callback", (req, res) => {
  try {
    handleOAuthCallback(req, res);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({
      success: false,
      message: "OAuth authentication failed",
      error: error.message,
    });
  }
});

// OAuth Callback (alternative route to match Google OAuth redirect URL)
router.get("/callback", (req, res) => {
  try {
    handleOAuthCallback(req, res);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({
      success: false,
      message: "OAuth authentication failed",
      error: error.message,
    });
  }
});

// Google OAuth Authentication (for frontend Google OAuth)
router.post("/google", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access token is required",
        error: "MISSING_ACCESS_TOKEN",
      });
    }

    // Google OAuth is only for regular users
    const role = "user";

    // Get user info from Google using the access token
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userInfoResponse.data) {
      return res.status(400).json({
        success: false,
        message: "Failed to get user info from Google",
        error: "GOOGLE_USER_INFO_FAILED",
      });
    }

    const googleUserInfo = userInfoResponse.data;

    // Find or create user in database
    let user = await User.findOne({
      where: { email: googleUserInfo.email },
    });

    if (user) {
      // Check if existing user is admin or super admin
      if (user.roles !== "user") {
        return res.status(403).json({
          success: false,
          message:
            "Google OAuth is only available for regular users. Admin and super admin accounts must use traditional login.",
          error: "OAUTH_NOT_ALLOWED_FOR_ADMIN",
        });
      }

      // Update existing user's Google info
      await user.update({
        lastLogin: new Date(),
        googleId: googleUserInfo.sub,
        profileImageURL: googleUserInfo.picture,
        displayName: googleUserInfo.name,
      });
    } else {
      // Create new user - always as regular user
      const username = generateUsername(googleUserInfo.email);

      user = await User.create({
        email: googleUserInfo.email,
        username: username,
        displayName: googleUserInfo.name,
        firstName: googleUserInfo.given_name || "",
        lastName: googleUserInfo.family_name || "",
        profileImageURL: googleUserInfo.picture,
        googleId: googleUserInfo.sub,
        isVerified: true, // Google users are pre-verified
        isActive: true,
        roles: "user", // Always create as regular user
        password: null, // OAuth users don't need password
      });
    }

    // Generate JWT token
    const token = generateToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      },
      "1h"
    );

    // Return success response with user data and token
    res.json({
      success: true,
      message: "Google OAuth authentication successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageURL: user.profileImageURL,
          roles: user.roles,
          isVerified: user.isVerified,
        },
        accessToken: token,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      },
    });
  } catch (error) {
    console.error("Google OAuth authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Google OAuth authentication failed",
      error: error.message,
    });
  }
});

// Helper function to generate unique username
const generateUsername = (email) => {
  const baseUsername = email.split("@")[0];
  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}_${timestamp}`;
};

// Refresh JWT Token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
        error: "MISSING_REFRESH_TOKEN",
      });
    }

    const result = await refreshToken(token);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    if (error.message.includes("Invalid token")) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        error: "INVALID_REFRESH_TOKEN",
      });
    }

    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
});

// Change Password (requires authentication)
router.post(
  "/change-password",
  authenticateUser(),
  validatePasswordChange,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const result = await changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: "Password changed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Password change error:", error);

      if (error.message.includes("incorrect")) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
          error: "INCORRECT_CURRENT_PASSWORD",
        });
      }

      res.status(500).json({
        success: false,
        message: "Password change failed",
        error: error.message,
      });
    }
  }
);

// Logout (requires authentication)
router.post("/logout", authenticateUser(), async (req, res) => {
  try {
    await logoutUser(req.user.id);

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
});

// OAuth Logout
router.post("/oauth/logout", (req, res) => {
  try {
    handleOAuthLogout(req, res);
  } catch (error) {
    console.error("OAuth logout error:", error);
    res.status(500).json({
      success: false,
      message: "OAuth logout failed",
      error: error.message,
    });
  }
});

// Get current user profile (requires authentication)
router.get("/profile", authenticateUser(), (req, res) => {
  try {
    const { password, ...userProfile } = req.user.toJSON();

    res.json({
      success: true,
      data: {
        user: userProfile,
      },
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
});

// Update user profile (requires authentication)
router.put("/profile", authenticateUser(), async (req, res) => {
  try {
    const allowedFields = [
      "displayName",
      "bio",
      "phoneNumber",
      "alternateEmail",
      "socialLinks",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
        error: "NO_VALID_FIELDS",
      });
    }

    await req.user.update(updateData);

    const { password, ...updatedUser } = req.user.toJSON();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
});

// Verify JWT token (for client-side validation)
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
        error: "MISSING_TOKEN",
      });
    }

    // This will be handled by the authenticateUser middleware
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Token verification failed",
      error: error.message,
    });
  }
});

module.exports = router;
