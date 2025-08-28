const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const { authenticateUser } = require("../middleware/authenticateUser");
const { requireAdminAccess, requireReadAccess } = require("../middleware/rbac");

// Apply authentication to all routes - don't require verification since RBAC handles permissions
router.use(authenticateUser({ requireVerified: false }));

// Read operations - any authenticated user can view
router.get("/", requireReadAccess(), tagController.getTags);
router.get("/:id", requireReadAccess(), tagController.getTagById);

// CRUD operations - admin only
router.post("/", requireAdminAccess(), tagController.createTag);
router.patch("/:id", requireAdminAccess(), tagController.updateTag);
router.delete("/:id", requireAdminAccess(), tagController.deleteTag);

module.exports = router;
