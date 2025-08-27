const { Brand, User, Brief } = require("../models");
const { Op } = require("sequelize");

// Mock user for trial run (since authentication is disabled)
const getMockUser = () => ({
  id: "00000000-0000-0000-0000-000000000000",
  username: "trial_user",
  email: "trial@skillzcollab.com",
  roles: "admin",
});

// Create a new brand
const createBrand = async (req, res) => {
  try {
    const brandData = req.body;

    // Validate required fields according to OpenAPI spec
    if (!brandData.name || !brandData.contact_email) {
      return res.status(400).json({
        code: 400,
        message: "Name and contact_email are required",
      });
    }

    // Check if brand with same contact email already exists
    const existingBrand = await Brand.findOne({
      where: { contactEmail: brandData.contact_email },
    });

    if (existingBrand) {
      return res.status(409).json({
        code: 409,
        message: "Brand with this contact email already exists",
      });
    }

    // Map request fields to model fields
    const brandModelData = {
      name: brandData.name,
      contactEmail: brandData.contact_email,
      registeredOffice: brandData.registered_office,
      address: brandData.address,
      businessField: brandData.business_field,
      logoUrl: brandData.logo_url,
      websiteUrl: brandData.website_url,
    };

    const brand = await Brand.create(brandModelData);

    // Map response to match OpenAPI spec
    const brandResponse = {
      id: brand.id,
      name: brand.name,
      contact_email: brand.contactEmail,
      registered_office: brand.registeredOffice,
      address: brand.address,
      business_field: brand.businessField,
      logo_url: brand.logoUrl,
      website_url: brand.websiteUrl,
      created_at: brand.createdAt,
    };

    res.status(201).json(brandResponse);
  } catch (error) {
    console.error("Error creating brand:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all brands
const getBrands = async (req, res) => {
  try {
    const { business_field, brand_id } = req.query;

    // Build where clause for filtering
    const whereClause = {};

    if (business_field) {
      whereClause.businessField = { [Op.like]: `%${business_field}%` };
    }

    if (brand_id) {
      // Validate UUID format
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          brand_id
        )
      ) {
        return res.status(400).json({
          code: 400,
          message: "Invalid brand ID format",
        });
      }
      whereClause.id = brand_id;
    }

    const brands = await Brand.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      order: [["createdAt", "DESC"]],
    });

    // Map response to match OpenAPI spec
    const brandsResponse = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      contact_email: brand.contactEmail,
      registered_office: brand.registeredOffice,
      address: brand.address,
      business_field: brand.businessField,
      logo_url: brand.logoUrl,
      website_url: brand.websiteUrl,
      created_at: brand.createdAt,
    }));

    res.json(brandsResponse);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get brand by ID
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brand ID format",
      });
    }

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        code: 404,
        message: "Brand not found",
      });
    }

    // Map response to match OpenAPI spec
    const brandResponse = {
      id: brand.id,
      name: brand.name,
      contact_email: brand.contactEmail,
      registered_office: brand.registeredOffice,
      address: brand.address,
      business_field: brand.businessField,
      logo_url: brand.logoUrl,
      website_url: brand.websiteUrl,
      created_at: brand.createdAt,
    };

    res.json(brandResponse);
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Update brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brand ID format",
      });
    }

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        code: 404,
        message: "Brand not found",
      });
    }

    // Check if contact email is being updated and if it conflicts
    if (
      updateData.contact_email &&
      updateData.contact_email !== brand.contactEmail
    ) {
      const existingBrand = await Brand.findOne({
        where: {
          contactEmail: updateData.contact_email,
          id: { [Op.ne]: id },
        },
      });

      if (existingBrand) {
        return res.status(409).json({
          code: 409,
          message: "Brand with this contact email already exists",
        });
      }
    }

    // Map request fields to model fields
    const updateModelData = {};
    if (updateData.name) updateModelData.name = updateData.name;
    if (updateData.contact_email)
      updateModelData.contactEmail = updateData.contact_email;
    if (updateData.registered_office)
      updateModelData.registeredOffice = updateData.registered_office;
    if (updateData.address) updateModelData.address = updateData.address;
    if (updateData.business_field)
      updateModelData.businessField = updateData.business_field;
    if (updateData.logo_url) updateModelData.logoUrl = updateData.logo_url;
    if (updateData.website_url)
      updateModelData.websiteUrl = updateData.website_url;

    await brand.update(updateModelData);

    // Map response to match OpenAPI spec
    const brandResponse = {
      id: brand.id,
      name: brand.name,
      contact_email: brand.contactEmail,
      registered_office: brand.registeredOffice,
      address: brand.address,
      business_field: brand.businessField,
      logo_url: brand.logoUrl,
      website_url: brand.websiteUrl,
      created_at: brand.createdAt,
    };

    res.json(brandResponse);
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Delete brand
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brand ID format",
      });
    }

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        code: 404,
        message: "Brand not found",
      });
    }

    // Check if brand has associated briefs
    const briefCount = await Brief.count({
      where: { brandId: id },
    });

    if (briefCount > 0) {
      return res.status(400).json({
        code: 400,
        message: "Cannot delete brand with associated briefs",
      });
    }

    await brand.destroy();

    res.status(204).json({
      code: 204,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get brand statistics
const getBrandStats = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        code: 404,
        message: "Brand not found",
      });
    }

    // Get brief statistics
    const briefStats = await Brief.findAll({
      where: { brandId: id },
      attributes: [
        "status",
        [Brief.sequelize.fn("COUNT", Brief.sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Get total briefs count
    const totalBriefs = await Brief.count({
      where: { brandId: id },
    });

    // Get active briefs count
    const activeBriefs = await Brief.count({
      where: {
        brandId: id,
        status: { [Op.in]: ["submission", "in_review"] },
      },
    });

    const stats = {
      brandId: id,
      brandName: brand.name,
      totalBriefs,
      activeBriefs,
      briefStatusBreakdown: briefStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {}),
      createdAt: brand.createdAt,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching brand stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getBrandStats,
};
