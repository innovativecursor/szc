const { Portfolio, User, Creative } = require("../models");

// Get all portfolios for a specific user
const getPortfoliosByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Validate user_id
    if (!user_id) {
      return res.status(400).json({
        code: 400,
        message: "user_id is required",
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

    // Get all portfolios for the user
    const portfolios = await Portfolio.findAll({
      where: { userId: user_id },
      include: [
        {
          model: Creative,
          as: "creatives",
          attributes: ["id", "title", "createdAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format response
    const formattedPortfolios = portfolios.map((portfolio) => ({
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      created_at: portfolio.createdAt,
      user_id: portfolio.userId,
      creatives_count: portfolio.creatives ? portfolio.creatives.length : 0,
      creatives: portfolio.creatives
        ? portfolio.creatives.map((creative) => ({
            id: creative.id,
            title: creative.title,
            created_at: creative.createdAt,
          }))
        : [],
    }));

    res.json(formattedPortfolios);
  } catch (error) {
    console.error("Error getting portfolios by user:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Create a new portfolio for a user
const createPortfolioByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { title, description } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        code: 400,
        message: "title is required",
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

    // Check ownership - users can only create portfolios for themselves
    if (user_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: "Access denied. You can only create portfolios for yourself.",
      });
    }

    // Create the portfolio
    const portfolio = await Portfolio.create({
      userId: user_id,
      title,
      description,
    });

    // Format response
    const formattedPortfolio = {
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      created_at: portfolio.createdAt,
      user_id: portfolio.userId,
    };

    res.status(201).json(formattedPortfolio);
  } catch (error) {
    console.error("Error creating portfolio:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get a specific portfolio by ID for a user
const getPortfolioByUser = async (req, res) => {
  try {
    const { user_id, portfolio_id } = req.params;

    // Validate parameters
    if (!user_id || !portfolio_id) {
      return res.status(400).json({
        code: 400,
        message: "user_id and portfolio_id are required",
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

    // Get the portfolio
    const portfolio = await Portfolio.findOne({
      where: {
        id: portfolio_id,
        userId: user_id,
      },
      include: [
        {
          model: Creative,
          as: "creatives",
          attributes: ["id", "title", "description", "createdAt"],
        },
      ],
    });

    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Format response
    const formattedPortfolio = {
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      created_at: portfolio.createdAt,
      user_id: portfolio.userId,
      creatives_count: portfolio.creatives ? portfolio.creatives.length : 0,
      creatives: portfolio.creatives
        ? portfolio.creatives.map((creative) => ({
            id: creative.id,
            title: creative.title,
            description: creative.description,
            created_at: creative.createdAt,
          }))
        : [],
    };

    res.json(formattedPortfolio);
  } catch (error) {
    console.error("Error getting portfolio:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Update a portfolio for a user
const updatePortfolioByUser = async (req, res) => {
  try {
    const { user_id, portfolio_id } = req.params;
    const { title, description } = req.body;

    // Validate parameters
    if (!user_id || !portfolio_id) {
      return res.status(400).json({
        code: 400,
        message: "user_id and portfolio_id are required",
      });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        code: 400,
        message: "User not found",
      });
    }

    // Get the portfolio
    const portfolio = await Portfolio.findOne({
      where: {
        id: portfolio_id,
        userId: user_id,
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Check ownership - users can only update their own portfolios
    if (portfolio.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: "Access denied. You can only update your own portfolios.",
      });
    }

    // Update the portfolio
    await portfolio.update({
      title: title !== undefined ? title : portfolio.title,
      description:
        description !== undefined ? description : portfolio.description,
    });

    // Format response
    const formattedPortfolio = {
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      created_at: portfolio.createdAt,
      user_id: portfolio.userId,
    };

    res.json(formattedPortfolio);
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Delete a portfolio for a user
const deletePortfolioByUser = async (req, res) => {
  try {
    const { user_id, portfolio_id } = req.params;

    // Validate parameters
    if (!user_id || !portfolio_id) {
      return res.status(400).json({
        code: 400,
        message: "user_id and portfolio_id are required",
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

    // Get the portfolio
    const portfolio = await Portfolio.findOne({
      where: {
        id: portfolio_id,
        userId: user_id,
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        code: 404,
        message: "Portfolio not found",
      });
    }

    // Check ownership - users can only delete their own portfolios
    if (portfolio.userId !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: "Access denied. You can only delete your own portfolios.",
      });
    }

    // Delete the portfolio (this will cascade delete associated creatives)
    await portfolio.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get all portfolios (with optional filters)
const getAllPortfolios = async (req, res) => {
  try {
    const { user_id } = req.query;
    const whereClause = {};

    if (user_id) {
      whereClause.userId = user_id;
    }

    const portfolios = await Portfolio.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Creative,
          as: "creatives",
          attributes: ["id", "title", "createdAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format response
    const formattedPortfolios = portfolios.map((portfolio) => ({
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      created_at: portfolio.createdAt,
      user_id: portfolio.userId,
      user: portfolio.user
        ? {
            id: portfolio.user.id,
            name: portfolio.user.name,
            email: portfolio.user.email,
          }
        : null,
      creatives_count: portfolio.creatives ? portfolio.creatives.length : 0,
      creatives: portfolio.creatives
        ? portfolio.creatives.map((creative) => ({
            id: creative.id,
            title: creative.title,
            created_at: creative.createdAt,
          }))
        : [],
    }));

    res.json(formattedPortfolios);
  } catch (error) {
    console.error("Error getting all portfolios:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getPortfoliosByUser,
  createPortfolioByUser,
  getPortfolioByUser,
  updatePortfolioByUser,
  deletePortfolioByUser,
  getAllPortfolios,
};
