const { Portfolio, User, Creative } = require("../models");
const { Op } = require("sequelize");

// Get all portfolios with optional filtering
const getPortfolios = async (req, res) => {
  try {
    const { category, experience, isFeatured } = req.query;
    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }
    if (experience) {
      whereClause.experience = experience;
    }
    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured === "true";
    }

    const portfolios = await Portfolio.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: [
        { model: User, as: "user" },
        { model: Creative, as: "creatives" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Get portfolio by ID
const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid portfolio ID format" });
    }

    const portfolio = await Portfolio.findByPk(id, {
      include: [
        { model: User, as: "user" },
        { model: Creative, as: "creatives" },
      ],
    });

    if (!portfolio) {
      return res
        .status(404)
        .json({ code: 404, message: "Portfolio not found" });
    }

    res.json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Create new portfolio
const createPortfolio = async (req, res) => {
  try {
    const { title, description, files } = req.body;

    // For trial run, we'll use a mock user ID
    const mockUserId = "550e8400-e29b-41d4-a716-446655440000";

    const portfolio = await Portfolio.create({
      userId: mockUserId,
      title,
      description,
      files: files || [],
      likeCount: 0,
    });

    res.status(201).json(portfolio);
  } catch (error) {
    console.error("Error creating portfolio:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Update portfolio
const updatePortfolio = async (req, res) => {
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
        .json({ code: 400, message: "Invalid portfolio ID format" });
    }

    const portfolio = await Portfolio.findByPk(id);
    if (!portfolio) {
      return res
        .status(404)
        .json({ code: 404, message: "Portfolio not found" });
    }

    // Update fields if provided
    if (title !== undefined) portfolio.title = title;
    if (description !== undefined) portfolio.description = description;
    if (files !== undefined) portfolio.files = files;

    await portfolio.save();
    res.json(portfolio);
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

// Delete portfolio
const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid portfolio ID format" });
    }

    const portfolio = await Portfolio.findByPk(id);
    if (!portfolio) {
      return res
        .status(404)
        .json({ code: 404, message: "Portfolio not found" });
    }

    await portfolio.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

module.exports = {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
