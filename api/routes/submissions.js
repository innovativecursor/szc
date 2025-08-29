const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const { authenticateUser } = require("../middleware/authenticateUser");
const {
  requireUserAccess,
  requireReadAccess,
  requireRegularUserAccess,
} = require("../middleware/rbac");

// Apply authentication to all routes
router.use(authenticateUser());

// Read operations - any authenticated user can view
router.get("/", requireReadAccess(), submissionController.getSubmissions);
router.get("/:id", requireReadAccess(), submissionController.getSubmissionById);
router.get(
  "/:id/reactions",
  requireReadAccess(),
  submissionController.getSubmissionReactionCounts
);

// CRUD operations - regular users only can manage their own submissions
router.post(
  "/",
  requireRegularUserAccess(),
  submissionController.createSubmission
);
router.patch(
  "/:id",
  requireRegularUserAccess(),
  submissionController.updateSubmission
);
router.delete(
  "/:id",
  requireRegularUserAccess(),
  submissionController.deleteSubmission
);

module.exports = router;
