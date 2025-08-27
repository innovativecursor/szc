// routes/index.js
const express = require("express");
const router = express.Router();

// Import route files
const brandsRoutes = require("./brands");
const briefsRoutes = require("./briefs");
const tagsRoutes = require("./tags");
const submissionsRoutes = require("./submissions");
const portfoliosRoutes = require("./portfolios");
const creativesRoutes = require("./creatives");
const reactionsRoutes = require("./reactions");

// API routes
router.use("/api/brands", brandsRoutes);
router.use("/api/briefs", briefsRoutes);
router.use("/api/tags", tagsRoutes);
router.use("/api/submissions", submissionsRoutes);
router.use("/api/portfolios", portfoliosRoutes);
router.use("/api/creatives", creativesRoutes);
router.use("/api/reactions", reactionsRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "SkillzCollab API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to SkillzCollab API",
    version: "1.0.0",
    endpoints: {
      brands: "/api/brands",
      briefs: "/api/briefs",
      tags: "/api/tags",
      submissions: "/api/submissions",
      portfolios: "/api/portfolios",
      creatives: "/api/creatives",
      reactions: "/api/reactions",
      health: "/health",
    },
  });
});

module.exports = router;
