const Tag = require("../models/Tag");
const { Op } = require("sequelize");

// Create a new tag
const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: "Tag name is required",
      });
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({
      where: { name: { [Op.like]: name } },
    });

    if (existingTag) {
      return res.status(400).json({
        code: 400,
        message: "Tag with this name already exists",
      });
    }

    const tag = await Tag.create({
      name,
      description,
    });

    res.status(201).json({
      code: 201,
      message: "Tag created successfully",
      data: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        created_at: tag.createdAt,
        updated_at: tag.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get all tags
const getTags = async (req, res) => {
  try {
    const { search } = req.query;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const tags = await Tag.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });
    // if (tags.length === 0) {
    //   return res.status(404).json({
    //     code: 404,
    //     message: "No tags found",
    //   });
    // }
    const tagsResponse = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      created_at: tag.createdAt,
      updated_at: tag.updatedAt,
    }));

    res.status(200).json(tagsResponse);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get tag by ID
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: "Tag not found",
      });
    }

    res.status(200).json({
      code: 200,
      message: "Tag retrieved successfully",
      data: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        created_at: tag.createdAt,
        updated_at: tag.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Update tag
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: "Tag not found",
      });
    }

    // Check if new name conflicts with existing tag
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({
        where: {
          name: { [Op.like]: name },
          id: { [Op.ne]: id },
        },
      });

      if (existingTag) {
        return res.status(400).json({
          code: 400,
          message: "Tag with this name already exists",
        });
      }
    }

    await tag.update({
      name: name || tag.name,
      description: description !== undefined ? description : tag.description,
    });

    res.status(200).json({
      code: 200,
      message: "Tag updated successfully",
      data: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        created_at: tag.createdAt,
        updated_at: tag.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Delete tag
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: "Tag not found",
      });
    }

    // TODO: Add check for associated briefs and followers when associations are implemented
    // For now, allow deletion without checks

    await tag.destroy();

    res.status(200).json({
      code: 200,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
};
