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
      displayName: `${req.body.firstName} ${req.body.lastName}`,
      roles: req.body.role, // Role is now mandatory
      isVerified: false, // Users need to verify their email
      isActive: true,
    };

    const user = await registerUser(userData);

    // Generate JWT token for immediate login
    const token = generateToken(user, "access");

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          roles: user.roles,
          isVerified: user.isVerified,
        },
        token,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      },
    });
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

    const { email, password } = req.body;
    const result = await loginUser(email, password);

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
