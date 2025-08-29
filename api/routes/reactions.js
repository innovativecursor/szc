const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");
const { authenticateUser } = require("../middleware/authenticateUser");
const {
  requireUserAccess,
  requireReadAccess,
  requireRegularUserAccess,
} = require("../middleware/rbac");

// Apply authentication to all routes
router.use(authenticateUser());

// Get all reactions with optional filtering - any authenticated user can view
router.get("/", requireReadAccess(), reactionController.getAllReactions);

// Get reactions for a specific submission - any authenticated user can view
router.get(
  "/submission/:submission_id",
  requireReadAccess(),
  reactionController.getReactionsBySubmission
);

// Create a new reaction on a submission - regular users only can create reactions
router.post(
  "/submission/:submission_id",
  requireRegularUserAccess(),
  reactionController.createReaction
);

// Get a specific reaction by ID - any authenticated user can view
router.get(
  "/:reaction_id",
  requireReadAccess(),
  reactionController.getReactionById
);

// Update a reaction - regular users only can update their own reactions
router.patch(
  "/:reaction_id",
  requireRegularUserAccess(),
  reactionController.updateReaction
);

// Delete a reaction - regular users only can delete their own reactions
router.delete(
  "/:reaction_id",
  requireRegularUserAccess(),
  reactionController.deleteReaction
);

module.exports = router;
