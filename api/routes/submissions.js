const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const { authenticateUser } = require("../middleware/authenticateUser");
const { requireUserAccess, requireReadAccess } = require("../middleware/rbac");

// Apply authentication to all routes
router.use(authenticateUser());

// Read operations - any authenticated user can view
router.get("/", requireReadAccess(), submissionController.getSubmissions);
router.get("/:id", requireReadAccess(), submissionController.getSubmissionById);

// CRUD operations - users can manage their own submissions
router.post("/", requireUserAccess(), submissionController.createSubmission);
router.patch(
  "/:id",
  requireUserAccess(),
  submissionController.updateSubmission
);
router.delete(
  "/:id",
  requireUserAccess(),
  submissionController.deleteSubmission
);

module.exports = router;
