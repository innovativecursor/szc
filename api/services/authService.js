const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { loadConfig } = require("../config/configLoader");

// Load configuration
const config = loadConfig();

// Generate JWT token
const generateToken = (payload, expiresIn = "1h") => {
  const secret = config.auth.jwt.signing_key;
  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: config.auth.jwt.issuer,
    audience: config.auth.jwt.audience,
    algorithm: config.auth.jwt.algorithm,
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const secret =
      config.auth.jwt.verification_key || config.auth.jwt.signing_key;
    return jwt.verify(token, secret, {
      issuer: config.auth.jwt.issuer,
      audience: config.auth.jwt.audience,
      algorithms: [config.auth.jwt.algorithm],
    });
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Hash password - using consistent salt rounds
const hashPassword = async (password) => {
  const saltRounds = 10; // Consistent with User model
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// User registration
const registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { email: userData.email },
          { username: userData.username },
        ],
      },
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    // Create user - password hashing handled by User model hooks
    const user = await User.create(userData);

    // Remove password from response
    const { password, ...userWithoutPassword } = user.toJSON();

    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// User login
const loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Check if user is OAuth-only (no password)
    if (!user.password) {
      throw new Error(
        "This account uses OAuth authentication. Please sign in with Google."
      );
    }

    // Verify password using User model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const accessToken = generateToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      },
      "1h" // Use hardcoded value for now to ensure compatibility
    );

    const refreshToken = generateToken(
      { id: user.id, type: "refresh" },
      "1h" // Use hardcoded value for now to ensure compatibility
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour in milliseconds
    };
  } catch (error) {
    throw error;
  }
};

// Refresh token
const refreshToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== "refresh") {
      throw new Error("Invalid refresh token");
    }

    // Get user
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // Generate new access token
    const newAccessToken = generateToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      },
      "1h" // Use hardcoded value for now to ensure compatibility
    );

    return {
      accessToken: newAccessToken,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour in milliseconds
    };
  } catch (error) {
    throw error;
  }
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password using User model's comparePassword method
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Update password - hashing handled by User model hooks
    await user.update({ password: newPassword });

    return { message: "Password changed successfully" };
  } catch (error) {
    throw error;
  }
};

// Reset password (forgot password flow)
const resetPassword = async (email, newPassword) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Update password - hashing handled by User model hooks
    await user.update({ password: newPassword });

    return { message: "Password reset successfully" };
  } catch (error) {
    throw error;
  }
};

// Validate user session
const validateSession = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "email",
        "username",
        "displayName",
        "roles",
        "isActive",
        "lastLoginAt",
      ],
    });

    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Logout user (invalidate tokens)
const logoutUser = async (userId) => {
  try {
    // In a real application, you might want to add the token to a blacklist
    // For now, we'll just return a success message
    // The client should remove the stored tokens

    // Update last logout time if you have such a field
    await User.update({ lastLogoutAt: new Date() }, { where: { id: userId } });

    return { message: "Logged out successfully" };
  } catch (error) {
    throw error;
  }
};

// Get user permissions
const getUserPermissions = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ["id", "roles"],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // This would integrate with your RBAC system
    // For now, return basic role-based permissions
    const permissions = {
      canRead: true,
      canWrite: ["user", "admin", "super_admin"].includes(user.roles),
      canUpdate: ["user", "admin", "super_admin"].includes(user.roles),
      canDelete: ["admin", "super_admin"].includes(user.roles),
      canManageUsers: ["admin", "super_admin"].includes(user.roles),
      canManageSystem: user.roles === "super_admin",
    };

    return permissions;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  registerUser,
  loginUser,
  refreshToken,
  changePassword,
  resetPassword,
  validateSession,
  logoutUser,
  getUserPermissions,
};
