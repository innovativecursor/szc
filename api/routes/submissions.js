const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");

// All routes open for trial run (no authentication required)
router.get("/", submissionController.getSubmissions);
router.get("/:id", submissionController.getSubmissionById);
router.post("/", submissionController.createSubmission);
router.patch("/:id", submissionController.updateSubmission);
router.delete("/:id", submissionController.deleteSubmission);

module.exports = router;
