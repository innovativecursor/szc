const express = require("express");
const router = express.Router();
const creativeController = require("../controllers/creativeController");
const { authenticateUser } = require("../middleware/authenticateUser");
const { requireUserAccess, requireReadAccess } = require("../middleware/rbac");
const {
  handleFileUpload,
  handleUploadError,
} = require("../middleware/uploadMiddleware");

// Apply authentication to all routes
router.use(authenticateUser());

// Get all creatives (with optional filters) - any authenticated user can view
router.get("/", requireReadAccess(), creativeController.getAllCreatives);

// Nested portfolio routes
// GET /portfolios/{portfolio_id}/creatives - Get all creatives for a portfolio
router.get(
  "/portfolios/:portfolio_id",
  requireReadAccess(),
  creativeController.getCreativesByPortfolio
);

// POST /portfolios/{portfolio_id}/creatives - Create a new creative in a portfolio
router.post(
  "/portfolios/:portfolio_id",
  requireUserAccess(),
  handleFileUpload("files", 10), // Handle up to 10 files, max 10MB each
  handleUploadError,
  creativeController.createCreativeByPortfolio
);

// GET /portfolios/{portfolio_id}/creatives/{creative_id} - Get a specific creative
router.get(
  "/portfolios/:portfolio_id/:creative_id",
  requireReadAccess(),
  creativeController.getCreativeByPortfolio
);

// PATCH /portfolios/{portfolio_id}/creatives/{creative_id} - Update a creative
router.patch(
  "/portfolios/:portfolio_id/:creative_id",
  requireUserAccess(),
  handleFileUpload("files", 10), // Handle up to 10 files, max 10MB each
  handleUploadError,
  creativeController.updateCreativeByPortfolio
);

// DELETE /portfolios/{portfolio_id}/creatives/{creative_id} - Delete a creative
router.delete(
  "/portfolios/:portfolio_id/:creative_id",
  requireUserAccess(),
  creativeController.deleteCreativeByPortfolio
);

module.exports = router;
