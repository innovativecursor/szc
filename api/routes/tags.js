const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const { authenticateUser } = require("../middleware/authenticateUser");
const { requireAdminAccess, requireReadAccess } = require("../middleware/rbac");

// Apply authentication to all routes
router.use(authenticateUser());

// Read operations - any authenticated user can view
router.get("/", requireReadAccess(), tagController.getTags);
router.get("/:id", requireReadAccess(), tagController.getTagById);

// CRUD operations - admin only
router.post("/", requireAdminAccess(), tagController.createTag);
router.patch("/:id", requireAdminAccess(), tagController.updateTag);
router.delete("/:id", requireAdminAccess(), tagController.deleteTag);

module.exports = router;
