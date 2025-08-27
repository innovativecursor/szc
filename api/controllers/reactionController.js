const { Reaction, Submission, User, Portfolio } = require("../models");
const { Op } = require("sequelize");

// Get all reactions with optional filtering
const getReactions = async (req, res) => {
  try {
    const { type, submission_id, user_id } = req.query;
    const whereClause = {};

    if (type) {
      whereClause.type = type;
    }
    if (submission_id) {
      whereClause.submissionId = submission_id;
    }
    if (user_id) {
      whereClause.userId = user_id;
    }

    const reactions = await Reaction.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: [
        { model: Submission, as: "submission" },
        { model: User, as: "user" },
        { model: Portfolio, as: "portfolio" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(reactions);
  } catch (error) {
    console.error("Error fetching reactions:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get reaction by ID
const getReactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid reaction ID format" });
    }

    const reaction = await Reaction.findByPk(id, {
      include: [
        { model: Submission, as: "submission" },
        { model: User, as: "user" },
        { model: Portfolio, as: "portfolio" },
      ],
    });

    if (!reaction) {
      return res.status(404).json({ code: 404, message: "Reaction not found" });
    }

    res.json(reaction);
  } catch (error) {
    console.error("Error fetching reaction:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Create new reaction
const createReaction = async (req, res) => {
  try {
    const { submission_id, user_id, type } = req.body;

    // Validate required fields
    if (!submission_id || !user_id || !type) {
      return res.status(400).json({
        code: 400,
        message: "submission_id, user_id, and type are required",
      });
    }

    // Validate UUIDs
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        submission_id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid submission_id format" });
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

    // Validate reaction type
    if (!["like", "vote"].includes(type)) {
      return res.status(400).json({
        code: 400,
        message: "Type must be either 'like' or 'vote'",
      });
    }

    // Check if submission exists
    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res
        .status(400)
        .json({ code: 400, message: "Submission not found" });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(400).json({ code: 400, message: "User not found" });
    }

    // Check if reaction already exists
    const existingReaction = await Reaction.findOne({
      where: {
        submissionId: submission_id,
        userId: user_id,
        type: type,
      },
    });

    if (existingReaction) {
      return res.status(400).json({
        code: 400,
        message: "Reaction already exists",
      });
    }

    const reaction = await Reaction.create({
      submissionId: submission_id,
      userId: user_id,
      type: type,
    });

    res.status(201).json(reaction);
  } catch (error) {
    console.error("Error creating reaction:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Update reaction
const updateReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid reaction ID format" });
    }

    const reaction = await Reaction.findByPk(id);
    if (!reaction) {
      return res.status(404).json({ code: 404, message: "Reaction not found" });
    }

    // Update type if provided
    if (type !== undefined) {
      if (!["like", "vote"].includes(type)) {
        return res.status(400).json({
          code: 400,
          message: "Type must be either 'like' or 'vote'",
        });
      }
      reaction.type = type;
    }

    await reaction.save();
    res.json(reaction);
  } catch (error) {
    console.error("Error updating reaction:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Delete reaction
const deleteReaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid reaction ID format" });
    }

    const reaction = await Reaction.findByPk(id);
    if (!reaction) {
      return res.status(404).json({ code: 404, message: "Reaction not found" });
    }

    await reaction.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting reaction:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  getReactions,
  getReactionById,
  createReaction,
  updateReaction,
  deleteReaction,
};
