const express = require("express");
const router = express.Router();
const creativeController = require("../controllers/creativeController");

// All routes open for trial run (no authentication required)
router.get("/", creativeController.getCreatives);
router.get("/:id", creativeController.getCreativeById);
router.post("/", creativeController.createCreative);
router.patch("/:id", creativeController.updateCreative);
router.delete("/:id", creativeController.deleteCreative);

module.exports = router;
