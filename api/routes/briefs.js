const express = require("express");
const router = express.Router();
const briefController = require("../controllers/briefController");

// All routes open for trial run (no authentication required)

router.get("/", briefController.getBriefs);
router.get("/:id", briefController.getBriefById);
router.get("/tag/:tagId", briefController.getBriefsByTag);

router.patch("/:id", briefController.updateBrief);

module.exports = router;
