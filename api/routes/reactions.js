const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");

// All routes open for trial run (no authentication required)
router.get("/", reactionController.getReactions);
router.get("/:id", reactionController.getReactionById);
router.post("/", reactionController.createReaction);
router.patch("/:id", reactionController.updateReaction);
router.delete("/:id", reactionController.deleteReaction);

module.exports = router;
