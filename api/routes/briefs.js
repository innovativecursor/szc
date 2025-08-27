const express = require("express");
const router = express.Router();
const briefController = require("../controllers/briefController");
const submissionController = require("../controllers/submissionController");
const {
  handleFileUpload,
  handleUploadError,
} = require("../middleware/uploadMiddleware");

// All routes open for trial run (no authentication required)

router.get("/", briefController.getBriefs);
router.get("/:id", briefController.getBriefById);
router.get("/tag/:tagId", briefController.getBriefsByTag);

router.patch("/:id", briefController.updateBrief);

// Nested submissions routes
router.get(
  "/:brief_id/submissions",
  submissionController.getSubmissionsByBrief
);
router.post(
  "/:brief_id/submissions",
  handleFileUpload("files", 10), // Handle up to 10 files, max 10MB each
  handleUploadError,
  submissionController.createSubmissionByBrief
);
router.get(
  "/:brief_id/submissions/:submission_id",
  submissionController.getSubmissionByBrief
);
router.patch(
  "/:brief_id/submissions/:submission_id",
  submissionController.updateSubmissionByBrief
);
router.delete(
  "/:brief_id/submissions/:submission_id",
  submissionController.deleteSubmissionByBrief
);

module.exports = router;
