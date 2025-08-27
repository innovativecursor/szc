const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const {
  handleFileUpload,
  handleUploadError,
} = require("../middleware/uploadMiddleware");

// Get all portfolios (with optional filters)
router.get("/", portfolioController.getAllPortfolios);

// Nested user routes
// GET /users/{user_id}/portfolios - Get all portfolios for a user
router.get("/users/:user_id", portfolioController.getPortfoliosByUser);

// POST /users/{user_id}/portfolios - Create a new portfolio for a user
router.post(
  "/users/:user_id",
  handleFileUpload("files", 10), // Handle up to 10 files, max 10MB each
  handleUploadError,
  portfolioController.createPortfolioByUser
);

// GET /users/{user_id}/portfolios/{portfolio_id} - Get a specific portfolio
router.get(
  "/users/:user_id/:portfolio_id",
  portfolioController.getPortfolioByUser
);

// PATCH /users/{user_id}/portfolios/{portfolio_id} - Update a portfolio
router.patch(
  "/users/:user_id/:portfolio_id",
  handleFileUpload("files", 10), // Handle up to 10 files, max 10MB each
  handleUploadError,
  portfolioController.updatePortfolioByUser
);

// DELETE /users/{user_id}/portfolios/{portfolio_id} - Delete a portfolio
router.delete(
  "/users/:user_id/:portfolio_id",
  portfolioController.deletePortfolioByUser
);

module.exports = router;
