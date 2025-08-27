const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const briefController = require("../controllers/briefController");

// All routes open for trial run (no authentication required)

router.get("/", brandController.getBrands);
router.get("/:id", brandController.getBrandById);
router.get("/:id/stats", brandController.getBrandStats);
router.post("/", brandController.createBrand);
router.patch("/:id", brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);

// Brand-specific brief routes
router.get("/:id/briefs", briefController.getBriefsByBrand);
router.post("/:id/briefs", briefController.createBriefForBrand);

module.exports = router;
