const express = require("express");
const router = express.Router();
const briefController = require("../controllers/briefController");
const submissionController = require("../controllers/submissionController");
const { authenticateUser } = require("../middleware/authenticateUser");
const {
  requireAdminAccess,
  requireReadAccess,
  requireUserAccess,
} = require("../middleware/rbac");
const {
  handleFileUpload,
  handleUploadError,
} = require("../middleware/uploadMiddleware");

// Apply authentication to all routes - don't require verification since RBAC handles permissions
router.use(authenticateUser({ requireVerified: false }));

// Read operations - any authenticated user can view
router.get("/", requireReadAccess(), briefController.getBriefs);
router.get("/:id", requireReadAccess(), briefController.getBriefById);
router.get("/tag/:tagId", requireReadAccess(), briefController.getBriefsByTag);

// Update operations - admin only
router.patch("/:id", requireAdminAccess(), briefController.updateBrief);

// Nested submissions routes - users can manage their own submissions
router.get(
  "/:brief_id/submissions",
  requireReadAccess(),
  submissionController.getSubmissionsByBrief
);
router.post(
  "/:brief_id/submissions",
  requireUserAccess(),
  handleFileUpload("files", 10), // Handle up to 10 files, max 10MB each
  handleUploadError,
  submissionController.createSubmissionByBrief
);
router.get(
  "/:brief_id/submissions/:submission_id",
  requireReadAccess(),
  submissionController.getSubmissionByBrief
);
router.patch(
  "/:brief_id/submissions/:submission_id",
  requireUserAccess(),
  submissionController.updateSubmissionByBrief
);
router.delete(
  "/:brief_id/submissions/:submission_id",
  requireUserAccess(),
  submissionController.deleteSubmissionByBrief
);

module.exports = router;
