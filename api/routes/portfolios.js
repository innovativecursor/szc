const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");

// All routes open for trial run (no authentication required)
router.get("/", portfolioController.getPortfolios);
router.get("/:id", portfolioController.getPortfolioById);
router.post("/", portfolioController.createPortfolio);
router.patch("/:id", portfolioController.updatePortfolio);
router.delete("/:id", portfolioController.deletePortfolio);

module.exports = router;
