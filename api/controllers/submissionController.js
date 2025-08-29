const { Submission, Brief, User, Reaction } = require("../models");
const { Op } = require("sequelize");
const { uploadMultipleFilesToS3 } = require("../services/s3Service");

// Get submissions by brief ID (nested route: /briefs/{brief_id}/submissions)
const getSubmissionsByBrief = async (req, res) => {
  try {
    const { brief_id } = req.params;

    // Validate brief_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brief_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brief_id format",
      });
    }

    // Check if brief exists
    const brief = await Brief.findByPk(brief_id);
    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    const submissions = await Submission.findAll({
      where: { briefId: brief_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "firstName", "lastName"], // Include all name fields
        },
        {
          model: Reaction,
          as: "reactions",
          attributes: ["id", "reaction", "userId"],
        },
      ],
      order: [["created_at", "DESC"]], // Use the correct database field name
    });

    // Transform submissions to match expected API response format with reaction counts
    const formattedSubmissions = submissions.map((submission) => {
      // Count reactions by type
      const reactions = submission.reactions || [];
      const likeCount = reactions.filter((r) => r.reaction === "like").length;
      const voteCount = reactions.filter((r) => r.reaction === "vote").length;

      return {
        id: submission.id,
        created_at: submission.createdAt,
        brief_id: submission.briefId,
        user_id: submission.userId,
        description: submission.description,
        is_finalist: submission.isFinalist,
        is_winner: submission.isWinner,
        likes: likeCount, // Count from reactions
        votes: voteCount, // Count from reactions
        files: submission.files || [],
        user: {
          id: submission.user.id,
          username: submission.user.username,
          email: submission.user.email,
          first_name: submission.user.firstName,
          last_name: submission.user.lastName,
        },
        reactions: reactions, // Include all reactions for debugging/advanced use
      };
    });

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching submissions by brief:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Create new submission by brief ID (nested route: /briefs/{brief_id}/submissions)
const createSubmissionByBrief = async (req, res) => {
  try {
    console.log("Submission creation request received");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User:", req.user?.id);

    const { brief_id } = req.params;
    const { description } = req.body;
    const uploadedFiles = req.files; // Files uploaded via multer

    // Use authenticated user's ID instead of body
    const user_id = req.user.id;

    // Check if files were uploaded
    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.log("No files uploaded");
      return res.status(400).json({
        code: 400,
        message: "At least one file is required",
      });
    }

    console.log(`${uploadedFiles.length} files received`);
    uploadedFiles.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
      });
    });

    // Validate brief_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brief_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brief_id format",
      });
    }

    // Check if brief exists
    const brief = await Brief.findByPk(brief_id);
    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Check if brief status allows new submissions
    if (brief.status !== "submission") {
      return res.status(400).json({
        code: 400,
        message: `Cannot create submission when brief status is "${brief.status}". Submissions are locked during review and winner selection.`,
      });
    }

    // Check if user already has a submission for this brief
    const existingSubmission = await Submission.findOne({
      where: {
        briefId: brief_id,
        userId: user_id,
      },
    });

    if (existingSubmission) {
      return res.status(409).json({
        code: 409,
        message:
          "You have already submitted work for this brief. You can edit your existing submission instead of creating a new one.",
        existingSubmissionId: existingSubmission.id,
        suggestion:
          "Use the update endpoint to modify your existing submission",
      });
    }

    // Upload files to S3
    let files = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      try {
        files = await uploadMultipleFilesToS3(uploadedFiles, "submissions");
      } catch (uploadError) {
        console.error("Error uploading files to S3:", uploadError);
        return res.status(500).json({
          code: 500,
          message: "Failed to upload files. Please try again.",
        });
      }
    } else {
      console.log("No files uploaded");
    }

    console.log(`${uploadedFiles.length} files received`);

    const submission = await Submission.create({
      briefId: brief_id,
      userId: user_id,
      description,
      files,
      isFinalist: false,
      isWinner: false,
      likes: 0,
      votes: 0,
    });

    // Transform response to match expected API format
    const formattedSubmission = {
      id: submission.id,
      created_at: submission.createdAt,
      brief_id: submission.briefId,
      user_id: submission.userId,
      description: submission.description,
      is_finalist: submission.isFinalist,
      is_winner: submission.isWinner,
      likes: submission.likes,
      votes: submission.votes,
      files: submission.files || [],
    };

    res.status(201).json(formattedSubmission);
  } catch (error) {
    console.error("Error creating submission:", error);

    // Handle unique constraint violation (user already has submission for this brief)
    if (
      error.name === "SequelizeUniqueConstraintError" &&
      error.fields &&
      error.fields.brief_id
    ) {
      return res.status(409).json({
        code: 409,
        message:
          "You have already submitted work for this brief. You can edit your existing submission instead of creating a new one.",
        suggestion:
          "Use the update endpoint to modify your existing submission",
      });
    }

    // Handle other database errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        details: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get all submissions with optional filtering
const getSubmissions = async (req, res) => {
  try {
    const { briefId, creativeId, status } = req.query;
    const whereClause = {};

    if (briefId) {
      whereClause.briefId = briefId;
    }
    if (creativeId) {
      whereClause.userId = creativeId;
    }
    if (status) {
      whereClause.status = status;
    }

    const submissions = await Submission.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: [
        { model: Brief, as: "brief" },
        { model: User, as: "user" },
        {
          model: Reaction,
          as: "reactions",
          attributes: ["id", "reaction", "userId"],
        },
      ],
      order: [["created_at", "DESC"]], // Use the correct database field name
    });

    // Transform submissions to include reaction counts
    const formattedSubmissions = submissions.map((submission) => {
      const reactions = submission.reactions || [];
      const likeCount = reactions.filter((r) => r.reaction === "like").length;
      const voteCount = reactions.filter((r) => r.reaction === "vote").length;

      return {
        ...submission.toJSON(),
        likes: likeCount,
        votes: voteCount,
        reactions: reactions,
      };
    });

    res.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Check if user can submit to a brief (returns existing submission if any)
const checkUserSubmissionStatus = async (req, res) => {
  try {
    const { brief_id } = req.params;
    const user_id = req.user.id;

    // Validate brief_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brief_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brief_id format",
      });
    }

    // Check if brief exists
    const brief = await Brief.findByPk(brief_id);
    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Check if user already has a submission for this brief
    const existingSubmission = await Submission.findOne({
      where: {
        briefId: brief_id,
        userId: user_id,
      },
    });

    res.json({
      canSubmit: !existingSubmission && brief.status === "submission",
      briefStatus: brief.status,
      existingSubmission: existingSubmission
        ? {
            id: existingSubmission.id,
            description: existingSubmission.description,
            files: existingSubmission.files,
            created_at: existingSubmission.createdAt,
            updated_at: existingSubmission.updatedAt,
          }
        : null,
      message: existingSubmission
        ? "You already have a submission for this brief. You can edit it instead."
        : brief.status === "submission"
          ? "You can submit work for this brief."
          : `Submissions are not allowed when brief status is "${brief.status}".`,
    });
  } catch (error) {
    console.error("Error checking user submission status:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get submission by ID
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid submission ID format",
      });
    }

    const submission = await Submission.findByPk(id, {
      include: [
        { model: Brief, as: "brief" },
        { model: User, as: "user" },
        {
          model: Reaction,
          as: "reactions",
          attributes: ["id", "reaction", "userId"],
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        code: 404,
        message: "Submission not found",
      });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Create new submission (legacy route - kept for backward compatibility)
const createSubmission = async (req, res) => {
  try {
    const { brief_id, user_id, description, files } = req.body;

    // Validate required fields
    if (
      !brief_id ||
      !user_id ||
      !files ||
      !Array.isArray(files) ||
      files.length === 0
    ) {
      return res.status(400).json({
        code: 400,
        message: "brief_id, user_id, and files array are required",
      });
    }

    // Validate UUIDs
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brief_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brief_id format",
      });
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        user_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid user_id format",
      });
    }

    // Validate files structure
    for (const file of files) {
      if (
        !file.id ||
        !file.filename ||
        !file.size ||
        !file.type ||
        !file.url ||
        !file.hash
      ) {
        return res.status(400).json({
          code: 400,
          message:
            "Each file must have id, filename, size, type, url, and hash",
        });
      }
    }

    // Check if brief exists and get its status
    const brief = await Brief.findByPk(brief_id);
    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Check if brief status allows new submissions
    if (brief.status !== "submission") {
      return res.status(400).json({
        code: 400,
        message: `Cannot create submission when brief status is "${brief.status}". Submissions are locked during review and winner selection.`,
      });
    }

    const submission = await Submission.create({
      briefId: brief_id,
      userId: user_id,
      description,
      files,
      isFinalist: false,
      isWinner: false,
      likes: 0,
      votes: 0,
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Update submission
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, files } = req.body;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid submission ID format",
      });
    }

    const submission = await Submission.findByPk(id, {
      include: [{ model: Brief, as: "brief" }],
    });

    if (!submission) {
      return res.status(404).json({
        code: 404,
        message: "Submission not found",
      });
    }

    // Check ownership - users can only update their own submissions
    if (submission.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: "Access denied. You can only update your own submissions.",
      });
    }

    // Check if brief status allows editing
    if (submission.brief && submission.brief.status !== "submission") {
      return res.status(400).json({
        code: 400,
        message: `Cannot edit submission when brief status is "${submission.brief.status}". Submissions are locked during review and winner selection.`,
      });
    }

    // Update fields if provided
    if (description !== undefined) submission.description = description;

    if (files !== undefined) {
      // Validate files structure
      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          if (
            !file.id ||
            !file.filename ||
            !file.size ||
            !file.type ||
            !file.url ||
            !file.hash
          ) {
            return res.status(400).json({
              code: 400,
              message:
                "Each file must have id, filename, size, type, url, and hash",
            });
          }
        }
        submission.files = files;
      }
    }

    await submission.save();

    // Transform response to match expected API format
    const formattedSubmission = {
      id: submission.id,
      created_at: submission.createdAt,
      brief_id: submission.briefId,
      user_id: submission.userId,
      description: submission.description,
      is_finalist: submission.isFinalist,
      is_winner: submission.isWinner,
      likes: submission.likes,
      votes: submission.votes,
      files: submission.files || [],
    };

    res.json(formattedSubmission);
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Update submission by brief ID (nested route: /briefs/{brief_id}/submissions/{submission_id})
const updateSubmissionByBrief = async (req, res) => {
  try {
    const { brief_id, submission_id } = req.params;
    const { description, files } = req.body;

    // Validate brief_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brief_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brief_id format",
      });
    }

    // Validate submission_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        submission_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid submission_id format",
      });
    }

    // Check if brief exists and get its status
    const brief = await Brief.findByPk(brief_id);
    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Check if brief status allows editing
    if (brief.status !== "submission") {
      return res.status(400).json({
        code: 400,
        message: `Cannot edit submission when brief status is "${brief.status}". Submissions are locked during review and winner selection.`,
      });
    }

    // Find submission and verify it belongs to the specified brief
    const submission = await Submission.findOne({
      where: {
        id: submission_id,
        briefId: brief_id,
      },
    });

    if (!submission) {
      return res.status(404).json({
        code: 404,
        message:
          "Submission not found or does not belong to the specified brief",
      });
    }

    // Check ownership - users can only update their own submissions
    if (submission.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: "Access denied. You can only update your own submissions.",
      });
    }

    // Update fields if provided
    if (description !== undefined) submission.description = description;

    if (files !== undefined) {
      // Validate files structure
      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          if (
            !file.id ||
            !file.filename ||
            !file.size ||
            !file.type ||
            !file.url ||
            !file.hash
          ) {
            return res.status(400).json({
              code: 400,
              message:
                "Each file must have id, filename, size, type, url, and hash",
            });
          }
        }
        submission.files = files;
      }
    }

    await submission.save();

    // Transform response to match expected API format
    const formattedSubmission = {
      id: submission.id,
      created_at: submission.createdAt,
      brief_id: submission.briefId,
      user_id: submission.userId,
      description: submission.description,
      is_finalist: submission.isFinalist,
      is_winner: submission.isWinner,
      likes: submission.likes,
      votes: submission.votes,
      files: submission.files || [],
    };

    res.json(formattedSubmission);
  } catch (error) {
    console.error("Error updating submission by brief:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Delete submission
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid submission ID format",
      });
    }

    const submission = await Submission.findByPk(id, {
      include: [{ model: Reaction, as: "reactions" }],
    });
    if (!submission) {
      return res.status(404).json({
        code: 404,
        message: "Submission not found",
      });
    }

    // Check ownership - users can only delete their own submissions
    if (submission.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: "Access denied. You can only delete your own submissions.",
      });
    }

    // Check if submission can be deleted (not already submitted)
    if (submission.status === "submitted") {
      return res.status(400).json({
        code: 400,
        message: "Cannot delete submitted submission",
      });
    }

    // Explicitly delete associated reactions to ensure cleanup
    if (submission.reactions && submission.reactions.length > 0) {
      await Reaction.destroy({
        where: { submissionId: id },
      });
    }

    await submission.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Delete submission by brief ID (nested route: /briefs/{brief_id}/submissions/{submission_id})
const deleteSubmissionByBrief = async (req, res) => {
  try {
    const { brief_id, submission_id } = req.params;

    // Validate brief_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brief_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brief_id format",
      });
    }

    // Validate submission_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        submission_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid submission_id format",
      });
    }

    // Check if brief exists
    const brief = await Brief.findByPk(brief_id);
    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Find submission and verify it belongs to the specified brief
    const submission = await Submission.findOne({
      where: {
        id: submission_id,
        briefId: brief_id,
      },
      include: [{ model: Reaction, as: "reactions" }],
    });

    if (!submission) {
      return res.status(404).json({
        code: 404,
        message:
          "Submission not found or does not belong to the specified brief",
      });
    }

    // Check ownership - users can only delete their own submissions
    if (submission.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: "Access denied. You can only delete your own submissions.",
      });
    }

    // Check if submission can be deleted (not already submitted)
    if (submission.status === "submitted") {
      return res.status(400).json({
        code: 400,
        message: "Cannot delete submitted submission",
      });
    }

    // Explicitly delete associated reactions to ensure cleanup
    if (submission.reactions && submission.reactions.length > 0) {
      await Reaction.destroy({
        where: { submissionId: submission_id },
      });
    }

    await submission.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting submission by brief:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get submission by brief ID and submission ID (nested route: /briefs/{brief_id}/submissions/{submission_id})
const getSubmissionByBrief = async (req, res) => {
  try {
    const { brief_id, submission_id } = req.params;

    // Validate brief_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brief_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brief_id format",
      });
    }

    // Validate submission_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        submission_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid submission_id format",
      });
    }

    // Check if brief exists
    const brief = await Brief.findByPk(brief_id);
    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Find submission and verify it belongs to the specified brief
    const submission = await Submission.findOne({
      where: {
        id: submission_id,
        briefId: brief_id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        code: 404,
        message:
          "Submission not found or does not belong to the specified brief",
      });
    }

    // Transform response to match expected API format
    const formattedSubmission = {
      id: submission.id,
      created_at: submission.createdAt,
      brief_id: submission.briefId,
      user_id: submission.userId,
      description: submission.description,
      is_finalist: submission.isFinalist,
      is_winner: submission.isWinner,
      likes: submission.likes,
      votes: submission.votes,
      files: submission.files || [],
    };

    res.json(formattedSubmission);
  } catch (error) {
    console.error("Error fetching submission by brief:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get reaction counts for a specific submission
const getSubmissionReactionCounts = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid submission ID format",
      });
    }

    // Check if submission exists
    const submission = await Submission.findByPk(id);
    if (!submission) {
      return res.status(404).json({
        code: 404,
        message: "Submission not found",
      });
    }

    // Get reactions for this submission
    const reactions = await Reaction.findAll({
      where: { submissionId: id },
      attributes: ["reaction"],
    });

    // Count reactions by type
    const likeCount = reactions.filter((r) => r.reaction === "like").length;
    const voteCount = reactions.filter((r) => r.reaction === "vote").length;

    res.json({
      submission_id: id,
      likes: likeCount,
      votes: voteCount,
      total_reactions: reactions.length,
      reactions: reactions.map((r) => r.reaction),
    });
  } catch (error) {
    console.error("Error fetching submission reaction counts:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  getSubmissionsByBrief,
  createSubmissionByBrief,
  getSubmissionByBrief,
  updateSubmissionByBrief,
  deleteSubmissionByBrief,
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionReactionCounts,
  checkUserSubmissionStatus,
};
