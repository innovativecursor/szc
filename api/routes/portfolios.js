const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const { authenticateUser } = require("../middleware/authenticateUser");
const {
  requireUserAccess,
  requireReadAccess,
  requireRegularUserAccess,
} = require("../middleware/rbac");

// Apply authentication to all routes
router.use(authenticateUser());

// Get all portfolios (with optional filters) - any authenticated user can view
router.get("/", requireReadAccess(), portfolioController.getAllPortfolios);

// Nested user routes
// GET /users/{user_id}/portfolios - Get all portfolios for a user
router.get(
  "/users/:user_id",
  requireReadAccess(),
  portfolioController.getPortfoliosByUser
);

// POST /users/{user_id}/portfolios - Create a new portfolio for a user (regular users only)
router.post(
  "/users/:user_id",
  requireRegularUserAccess(),
  portfolioController.createPortfolioByUser
);

// GET /users/{user_id}/portfolios/{portfolio_id} - Get a specific portfolio
router.get(
  "/users/:user_id/:portfolio_id",
  requireReadAccess(),
  portfolioController.getPortfolioByUser
);

// PATCH /users/{user_id}/portfolios/{portfolio_id} - Update a portfolio (regular users only)
router.patch(
  "/users/:user_id/:portfolio_id",
  requireRegularUserAccess(),
  portfolioController.updatePortfolioByUser
);

// DELETE /users/{user_id}/portfolios/{portfolio_id} - Delete a portfolio (regular users only)
router.delete(
  "/users/:user_id/:portfolio_id",
  requireRegularUserAccess(),
  portfolioController.deletePortfolioByUser
);

module.exports = router;
