const { Reaction, Submission, User } = require("../models");
const { Op } = require("sequelize");

// Get all reactions for a specific submission
const getReactionsBySubmission = async (req, res) => {
  try {
    const { submission_id } = req.params;

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

    // Check if submission exists
    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({
        code: 404,
        message: "Submission not found",
      });
    }

    const reactions = await Reaction.findAll({
      where: { submissionId: submission_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform reactions to match expected API response format
    const formattedReactions = reactions.map((reaction) => ({
      id: reaction.id,
      created_at: reaction.createdAt,
      submission_id: reaction.submissionId,
      user_id: reaction.userId,
      reaction: reaction.reaction,
    }));

    res.json(formattedReactions);
  } catch (error) {
    console.error("Error fetching reactions by submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Create a new reaction on a submission
const createReaction = async (req, res) => {
  try {
    const { submission_id } = req.params;
    const { user_id, reaction } = req.body;

    // Validate required fields
    if (!user_id || !reaction) {
      return res.status(400).json({
        code: 400,
        message: "user_id and reaction are required",
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

    // Validate user_id UUID format
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

    // Validate reaction type
    const validReactions = ["like", "love", "wow", "haha", "sad", "angry"];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({
        code: 400,
        message: `Invalid reaction type. Must be one of: ${validReactions.join(
          ", "
        )}`,
      });
    }

    // Check if submission exists
    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({
        code: 404,
        message: "Submission not found",
      });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    // Check if user already reacted to this submission
    const existingReaction = await Reaction.findOne({
      where: {
        submissionId: submission_id,
        userId: user_id,
      },
    });

    if (existingReaction) {
      // Update existing reaction
      existingReaction.reaction = reaction;
      await existingReaction.save();

      const formattedReaction = {
        id: existingReaction.id,
        created_at: existingReaction.createdAt,
        submission_id: existingReaction.submissionId,
        user_id: existingReaction.userId,
        reaction: existingReaction.reaction,
      };

      return res.json(formattedReaction);
    }

    // Create new reaction
    const newReaction = await Reaction.create({
      submissionId: submission_id,
      userId: user_id,
      reaction,
    });

    // Transform response to match expected API format
    const formattedReaction = {
      id: newReaction.id,
      created_at: newReaction.createdAt,
      submission_id: newReaction.submissionId,
      user_id: newReaction.userId,
      reaction: newReaction.reaction,
    };

    res.status(201).json(formattedReaction);
  } catch (error) {
    console.error("Error creating reaction:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get a specific reaction by ID
const getReactionById = async (req, res) => {
  try {
    const { reaction_id } = req.params;

    // Validate reaction_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        reaction_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid reaction_id format",
      });
    }

    const reaction = await Reaction.findByPk(reaction_id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!reaction) {
      return res.status(404).json({
        code: 404,
        message: "Reaction not found",
      });
    }

    // Transform response to match expected API format
    const formattedReaction = {
      id: reaction.id,
      created_at: reaction.createdAt,
      submission_id: reaction.submissionId,
      user_id: reaction.userId,
      reaction: reaction.reaction,
    };

    res.json(formattedReaction);
  } catch (error) {
    console.error("Error fetching reaction by ID:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Update a reaction
const updateReaction = async (req, res) => {
  try {
    const { reaction_id } = req.params;
    const { reaction } = req.body;

    // Validate reaction_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        reaction_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid reaction_id format",
      });
    }

    // Validate reaction type
    const validReactions = ["like", "love", "wow", "haha", "sad", "angry"];
    if (!reaction || !validReactions.includes(reaction)) {
      return res.status(400).json({
        code: 400,
        message: `Valid reaction type is required. Must be one of: ${validReactions.join(
          ", "
        )}`,
      });
    }

    const existingReaction = await Reaction.findByPk(reaction_id);
    if (!existingReaction) {
      return res.status(404).json({
        code: 404,
        message: "Reaction not found",
      });
    }

    // Update reaction
    existingReaction.reaction = reaction;
    await existingReaction.save();

    // Transform response to match expected API format
    const formattedReaction = {
      id: existingReaction.id,
      created_at: existingReaction.createdAt,
      submission_id: existingReaction.submissionId,
      user_id: existingReaction.userId,
      reaction: existingReaction.reaction,
    };

    res.json(formattedReaction);
  } catch (error) {
    console.error("Error updating reaction:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Delete a reaction
const deleteReaction = async (req, res) => {
  try {
    const { reaction_id } = req.params;

    // Validate reaction_id UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        reaction_id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid reaction_id format",
      });
    }

    const reaction = await Reaction.findByPk(reaction_id);
    if (!reaction) {
      return res.status(404).json({
        code: 404,
        message: "Reaction not found",
      });
    }

    await reaction.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting reaction:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get all reactions for a specific submission
const getAllReactions = async (req, res) => {
  try {
    const { submission_id } = req.query;

    if (!submission_id) {
      return res.status(400).json({
        code: 400,
        message: "submission_id is required",
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

    const reactions = await Reaction.findAll({
      where: { submissionId: submission_id },
      order: [["createdAt", "DESC"]],
    });

    // Transform reactions to match expected API response format
    const formattedReactions = reactions.map((reaction) => ({
      id: reaction.id,
      created_at: reaction.createdAt,
      submission_id: reaction.submissionId,
      user_id: reaction.userId,
      reaction: reaction.reaction,
    }));

    res.json(formattedReactions);
  } catch (error) {
    console.error("Error fetching reactions for submission:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  getReactionsBySubmission,
  createReaction,
  getReactionById,
  updateReaction,
  deleteReaction,
  getAllReactions,
};
