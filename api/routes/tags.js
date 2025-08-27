const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");

// All routes open for trial run (no authentication required)

router.get("/", tagController.getTags);
router.get("/:id", tagController.getTagById);
router.post("/", tagController.createTag);
router.patch("/:id", tagController.updateTag);
router.delete("/:id", tagController.deleteTag);

module.exports = router;
