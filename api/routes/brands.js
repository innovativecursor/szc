const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const briefController = require("../controllers/briefController");
const { authenticateUser } = require("../middleware/authenticateUser");
const { requireAdminAccess, requireReadAccess } = require("../middleware/rbac");

// Apply authentication to all routes - don't require verification since RBAC handles permissions
router.use(authenticateUser({ requireVerified: false }));

// Read operations - any authenticated user can view
router.get("/", requireReadAccess(), brandController.getBrands);
router.get("/:id", requireReadAccess(), brandController.getBrandById);
router.get("/:id/stats", requireReadAccess(), brandController.getBrandStats);

// CRUD operations - admin only
router.post("/", requireAdminAccess(), brandController.createBrand);
router.patch("/:id", requireAdminAccess(), brandController.updateBrand);
router.delete("/:id", requireAdminAccess(), brandController.deleteBrand);

// Brand-specific brief routes
router.get(
  "/:id/briefs",
  requireReadAccess(),
  briefController.getBriefsByBrand
);
router.post(
  "/:id/briefs",
  requireAdminAccess(),
  briefController.createBriefForBrand
);

module.exports = router;
