const { Creative, Portfolio, User } = require("../models");
const { Op } = require("sequelize");

// Get all creatives with optional filtering
const getCreatives = async (req, res) => {
  try {
    const { creativeType, experience, availability } = req.query;
    const whereClause = {};

    if (creativeType) {
      whereClause.creativeType = creativeType;
    }
    if (experience) {
      whereClause.experience = experience;
    }
    if (availability) {
      whereClause.availability = availability;
    }

    const creatives = await Creative.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: [
        { model: Portfolio, as: "portfolio" },
        { model: User, as: "user" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get creative by ID
const getCreativeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid creative ID format" });
    }

    const creative = await Creative.findByPk(id, {
      include: [
        { model: Portfolio, as: "portfolio" },
        { model: User, as: "user" },
      ],
    });

    if (!creative) {
      return res.status(404).json({ code: 404, message: "Creative not found" });
    }

    res.json(creative);
  } catch (error) {
    console.error("Error fetching creative:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Create new creative
const createCreative = async (req, res) => {
  try {
    const { portfolioId, title, description, files } = req.body;

    // Validate required fields
    if (!portfolioId) {
      return res.status(400).json({
        code: 400,
        message: "portfolioId is required",
      });
    }

    // Validate UUID
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        portfolioId
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid portfolioId format" });
    }

    // Check if portfolio exists
    const portfolio = await Portfolio.findByPk(portfolioId);
    if (!portfolio) {
      return res
        .status(400)
        .json({ code: 400, message: "Portfolio not found" });
    }

    const creative = await Creative.create({
      portfolioId,
      title,
      description,
      files: files || [],
    });

    res.status(201).json(creative);
  } catch (error) {
    console.error("Error creating creative:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Update creative
const updateCreative = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, files } = req.body;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid creative ID format" });
    }

    const creative = await Creative.findByPk(id);
    if (!creative) {
      return res.status(404).json({ code: 404, message: "Creative not found" });
    }

    // Update fields if provided
    if (title !== undefined) creative.title = title;
    if (description !== undefined) creative.description = description;
    if (files !== undefined) creative.files = files;

    await creative.save();
    res.json(creative);
  } catch (error) {
    console.error("Error updating creative:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Delete creative
const deleteCreative = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid creative ID format" });
    }

    const creative = await Creative.findByPk(id);
    if (!creative) {
      return res.status(404).json({ code: 404, message: "Creative not found" });
    }

    await creative.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting creative:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  getCreatives,
  getCreativeById,
  createCreative,
  updateCreative,
  deleteCreative,
};
