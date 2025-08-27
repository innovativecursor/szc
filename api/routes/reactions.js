const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");

// All routes open for trial run (no authentication required)

// Get all reactions with optional filtering
router.get("/", reactionController.getAllReactions);

// Get reactions for a specific submission
router.get(
  "/submission/:submission_id",
  reactionController.getReactionsBySubmission
);

// Create a new reaction on a submission
router.post("/submission/:submission_id", reactionController.createReaction);

// Get a specific reaction by ID
router.get("/:reaction_id", reactionController.getReactionById);

// Update a reaction
router.patch("/:reaction_id", reactionController.updateReaction);

// Delete a reaction
router.delete("/:reaction_id", reactionController.deleteReaction);

module.exports = router;
