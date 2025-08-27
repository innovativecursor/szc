const { Submission, Brief, User } = require("../models");
const { Op } = require("sequelize");

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
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
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
      return res
        .status(400)
        .json({ code: 400, message: "Invalid submission ID format" });
    }

    const submission = await Submission.findByPk(id, {
      include: [
        { model: Brief, as: "brief" },
        { model: User, as: "user" },
      ],
    });

    if (!submission) {
      return res
        .status(404)
        .json({ code: 404, message: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Create new submission
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
      return res
        .status(400)
        .json({ code: 400, message: "Invalid brief_id format" });
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        user_id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid user_id format" });
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

    const submission = await Submission.create({
      briefId: brief_id,
      userId: user_id,
      description,
      files,
      isFinalist: false,
      isWinner: false,
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
    const { description, is_finalist, is_winner, files } = req.body;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid submission ID format" });
    }

    const submission = await Submission.findByPk(id);
    if (!submission) {
      return res
        .status(404)
        .json({ code: 404, message: "Submission not found" });
    }

    // Update fields if provided
    if (description !== undefined) submission.description = description;
    if (is_finalist !== undefined) submission.isFinalist = is_finalist;
    if (is_winner !== undefined) submission.isWinner = is_winner;
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
    res.json(submission);
  } catch (error) {
    console.error("Error updating submission:", error);
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
      return res
        .status(400)
        .json({ code: 400, message: "Invalid submission ID format" });
    }

    const submission = await Submission.findByPk(id);
    if (!submission) {
      return res
        .status(404)
        .json({ code: 404, message: "Submission not found" });
    }

    // Check if submission can be deleted (not already submitted)
    if (submission.status === "submitted") {
      return res.status(400).json({
        code: 400,
        message: "Cannot delete submitted submission",
      });
    }

    await submission.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
};
