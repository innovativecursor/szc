const { Creative, Portfolio, User } = require("../models");
const { uploadMultipleFilesToS3 } = require("../services/s3Service");

// Get all creatives for a specific portfolio
const getCreativesByPortfolio = async (req, res) => {
  try {
    const { portfolio_id } = req.params;

    // Validate portfolio_id
    if (!portfolio_id) {
      return res.status(400).json({
        code: 400,
        message: "portfolio_id is required",
      });
    }

    // Check if portfolio exists
    const portfolio = await Portfolio.findByPk(portfolio_id);
    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Get all creatives for the portfolio
    const creatives = await Creative.findAll({
      where: { portfolioId: portfolio_id },
      order: [["createdAt", "DESC"]],
    });

    // Format response
    const formattedCreatives = creatives.map((creative) => ({
      id: creative.id,
      title: creative.title,
      description: creative.description,
      files: creative.files || [],
      created_at: creative.createdAt,
      portfolio_id: creative.portfolioId,
    }));

    res.json(formattedCreatives);
  } catch (error) {
    console.error("Error getting creatives by portfolio:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Create a new creative in a specific portfolio
const createCreativeByPortfolio = async (req, res) => {
  try {
    const { portfolio_id } = req.params;
    const { title, description } = req.body;
    const uploadedFiles = req.files; // Files uploaded via multer

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        code: 400,
        message: "title is required",
      });
    }

    // Check if portfolio exists
    const portfolio = await Portfolio.findByPk(portfolio_id);
    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Upload files to S3
    let files = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      try {
        files = await uploadMultipleFilesToS3(uploadedFiles, "creatives");
      } catch (uploadError) {
        console.error("Error uploading files to S3:", uploadError);
        return res.status(500).json({
          code: 500,
          message: "Failed to upload files. Please try again.",
        });
      }
    }

    // Create the creative
    const creative = await Creative.create({
      portfolioId: portfolio_id,
      title,
      description,
      files,
    });

    // Format response
    const formattedCreative = {
      id: creative.id,
      title: creative.title,
      description: creative.description,
      files: creative.files || [],
      created_at: creative.createdAt,
      portfolio_id: creative.portfolioId,
    };

    res.status(201).json(formattedCreative);
  } catch (error) {
    console.error("Error creating creative:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get a specific creative by ID within a portfolio
const getCreativeByPortfolio = async (req, res) => {
  try {
    const { portfolio_id, creative_id } = req.params;

    // Validate parameters
    if (!portfolio_id || !creative_id) {
      return res.status(400).json({
        code: 400,
        message: "portfolio_id and creative_id are required",
      });
    }

    // Check if portfolio exists
    const portfolio = await Portfolio.findByPk(portfolio_id);
    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Get the creative
    const creative = await Creative.findOne({
      where: {
        id: creative_id,
        portfolioId: portfolio_id,
      },
    });

    if (!creative) {
      return res.status(404).json({
        code: 404,
        message: "Creative not found",
      });
    }

    // Format response
    const formattedCreative = {
      id: creative.id,
      title: creative.title,
      description: creative.description,
      files: creative.files || [],
      created_at: creative.createdAt,
      portfolio_id: creative.portfolioId,
    };

    res.json(formattedCreative);
  } catch (error) {
    console.error("Error getting creative:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Update a creative within a portfolio
const updateCreativeByPortfolio = async (req, res) => {
  try {
    const { portfolio_id, creative_id } = req.params;
    const { title, description } = req.body;
    const uploadedFiles = req.files; // Files uploaded via multer

    // Validate parameters
    if (!portfolio_id || !creative_id) {
      return res.status(400).json({
        code: 400,
        message: "portfolio_id and creative_id are required",
      });
    }

    // Check if portfolio exists
    const portfolio = await Portfolio.findByPk(portfolio_id);
    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Get the creative
    const creative = await Creative.findOne({
      where: {
        id: creative_id,
        portfolioId: portfolio_id,
      },
    });

    if (!creative) {
      return res.status(404).json({
        code: 404,
        message: "Creative not found",
      });
    }

    // Handle file uploads if new files are provided
    let files = creative.files || [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      try {
        const newFiles = await uploadMultipleFilesToS3(
          uploadedFiles,
          "creatives"
        );
        files = newFiles; // Replace existing files with new ones
      } catch (uploadError) {
        console.error("Error uploading files to S3:", uploadError);
        return res.status(500).json({
          code: 500,
          message: "Failed to upload files. Please try again.",
        });
      }
    }

    // Update the creative
    await creative.update({
      title: title !== undefined ? title : creative.title,
      description:
        description !== undefined ? description : creative.description,
      files,
    });

    // Format response
    const formattedCreative = {
      id: creative.id,
      title: creative.title,
      description: creative.description,
      files: creative.files || [],
      created_at: creative.createdAt,
      portfolio_id: creative.portfolioId,
    };

    res.json(formattedCreative);
  } catch (error) {
    console.error("Error updating creative:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Delete a creative from a portfolio
const deleteCreativeByPortfolio = async (req, res) => {
  try {
    const { portfolio_id, creative_id } = req.params;

    // Validate parameters
    if (!portfolio_id || !creative_id) {
      return res.status(400).json({
        code: 400,
        message: "portfolio_id and creative_id are required",
      });
    }

    // Check if portfolio exists
    const portfolio = await Portfolio.findByPk(portfolio_id);
    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Get the creative
    const creative = await Creative.findOne({
      where: {
        id: creative_id,
        portfolioId: portfolio_id,
      },
    });

    if (!creative) {
      return res.status(404).json({
        code: 404,
        message: "Creative not found",
      });
    }

    // Delete the creative
    await creative.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting creative:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get all creatives (with optional filters)
const getAllCreatives = async (req, res) => {
  try {
    const { portfolio_id, user_id } = req.query;
    const whereClause = {};

    if (portfolio_id) {
      whereClause.portfolioId = portfolio_id;
    }

    // If user_id is provided, filter by portfolios owned by that user
    let creatives;
    if (user_id) {
      const userPortfolios = await Portfolio.findAll({
        where: { userId: user_id },
        attributes: ["id"],
      });
      const portfolioIds = userPortfolios.map((p) => p.id);
      whereClause.portfolioId = { [require("sequelize").Op.in]: portfolioIds };
    }

    creatives = await Creative.findAll({
      where: whereClause,
      include: [
        {
          model: Portfolio,
          as: "portfolio",
          attributes: ["id", "title", "userId"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format response
    const formattedCreatives = creatives.map((creative) => ({
      id: creative.id,
      title: creative.title,
      description: creative.description,
      files: creative.files || [],
      created_at: creative.createdAt,
      portfolio_id: creative.portfolioId,
      portfolio: creative.portfolio
        ? {
            id: creative.portfolio.id,
            title: creative.portfolio.title,
            user_id: creative.portfolio.userId,
          }
        : null,
    }));

    res.json(formattedCreatives);
  } catch (error) {
    console.error("Error getting all creatives:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getCreativesByPortfolio,
  createCreativeByPortfolio,
  getCreativeByPortfolio,
  updateCreativeByPortfolio,
  deleteCreativeByPortfolio,
  getAllCreatives,
};
