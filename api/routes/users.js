const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateUser } = require("../middleware/authenticateUser");
const { requireAdminAccess, requireUserAccess } = require("../middleware/rbac");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Validation middleware for user updates
const validateUserUpdate = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Display name must be between 1 and 100 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ min: 0, max: 1000 })
    .withMessage("Bio must be less than 1000 characters"),
  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ min: 0, max: 20 })
    .withMessage("Phone number must be less than 20 characters"),
  body("alternateEmail")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),
  body("roles")
    .optional()
    .isIn(["user", "admin", "super_admin"])
    .withMessage("Role must be one of: user, admin, super_admin"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("skills.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Each skill must be between 1 and 100 characters"),
  body("topSpecialities")
    .optional()
    .isArray()
    .withMessage("Top specialities must be an array"),
  body("topSpecialities.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Each speciality must be between 1 and 100 characters"),
];

// Apply authentication middleware to all routes
router.use(authenticateUser());

// GET /users - Get all users (Admin and Super Admin only)
router.get("/", requireAdminAccess(), getUsers);

// GET /users/:id - Get user by ID (Admin and Super Admin only)
router.get("/:id", requireAdminAccess(), getUserById);

// PATCH /users/:id - Update user (Admin, Super Admin, or self-update)
router.patch(
  "/:id",
  validateUserUpdate,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  updateUser
);

// DELETE /users/:id - Delete user (Admin and Super Admin only)
router.delete("/:id", requireAdminAccess(), deleteUser);

module.exports = router;
