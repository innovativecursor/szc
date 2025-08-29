const { Brief, Brand, Tag, User, Submission } = require("../models");
const { Op } = require("sequelize");
const { sendBriefNotification } = require("../services/notificationService");
const {
  uploadMultipleFilesToS3,
  uploadBase64ImagesToS3,
} = require("../services/s3Service");

// Helper function to validate brief dates and update status
const validateAndUpdateBriefDates = async (briefData, existingBrief = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  const errors = [];

  // Validate submission deadline
  if (briefData.submissionDeadline) {
    const submissionDeadline = new Date(briefData.submissionDeadline);
    if (submissionDeadline <= today) {
      errors.push("Submission deadline must be after today's date");
    }
  }

  // Validate voting start
  if (briefData.votingStart) {
    const votingStart = new Date(briefData.votingStart);
    if (votingStart < today) {
      errors.push("Voting start date cannot be before today");
    }
  }

  // Validate voting end
  if (briefData.votingEnd) {
    const votingEnd = new Date(briefData.votingEnd);

    // Voting end must be after voting start
    if (briefData.votingStart && votingEnd <= new Date(briefData.votingStart)) {
      errors.push("Voting end date must be after voting start date");
    }

    // Voting end must not exceed submission deadline
    if (
      briefData.submissionDeadline &&
      votingEnd > new Date(briefData.submissionDeadline)
    ) {
      errors.push("Voting end date cannot exceed submission deadline");
    }
  }

  // If updating an existing brief, check if submission deadline has passed
  if (existingBrief && existingBrief.submissionDeadline) {
    const submissionDeadline = new Date(existingBrief.submissionDeadline);
    if (submissionDeadline <= today && existingBrief.status === "submission") {
      // Automatically change status to in_review
      await existingBrief.update({ status: "in_review" });
      console.log(
        `Brief ${existingBrief.id} status automatically changed from submission to in_review`
      );
    }
  }

  return { errors, isValid: errors.length === 0 };
};

// Mock user for trial run (since authentication is disabled)
const getMockUser = () => ({
  id: "00000000-0000-0000-0000-000000000000",
  username: "trial_user",
  email: "trial@skillzcollab.com",
  roles: "admin",
});

// Helper function to map brief data to response format
const mapBriefToResponse = (brief) => ({
  id: brief.id,
  brand_id: brief.brandId,
  title: brief.title,
  description: brief.description,
  is_paid: brief.isPaid,
  prize_amount: brief.prizeAmount,
  submission_deadline: brief.submissionDeadline,
  voting_start: brief.votingStart,
  voting_end: brief.votingEnd,
  winner_user_id: brief.winnerUserId,
  status: brief.status,
  crm_user_id: brief.crmUserId,
  is_active: brief.isActive,
  created_at: brief.createdAt,
  updated_at: brief.updatedAt,
  tags: brief.tags
    ? brief.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
        created_at: tag.createdAt,
        updated_at: tag.updatedAt,
      }))
    : [],
  files: brief.files || [],
});

// Get all briefs
const getBriefs = async (req, res) => {
  try {
    const { status, isActive } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    // Only filter by isActive if explicitly provided, otherwise get all briefs
    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    // First, check and update any briefs with expired submission deadlines
    await autoUpdateBriefStatuses();

    const briefs = await Brief.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    const briefsResponse = briefs.map(mapBriefToResponse);

    res.json(briefsResponse);
  } catch (error) {
    console.error("Error fetching briefs:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get brief by ID
const getBriefById = async (req, res) => {
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
        message: "Invalid brief ID format",
      });
    }

    const brief = await Brief.findByPk(id, {
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name", "logoUrl"] },
      ],
    });

    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Check if submission deadline has passed and auto-update status
    await validateAndUpdateBriefDates({}, brief);

    res.status(200).json({
      code: 200,
      message: "Brief retrieved successfully",
      data: mapBriefToResponse(brief),
    });
  } catch (error) {
    console.error("Error fetching brief:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Update brief
const updateBrief = async (req, res) => {
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
        message: "Invalid brief ID format",
      });
    }

    const brief = await Brief.findByPk(id);

    if (!brief) {
      return res.status(404).json({
        code: 404,
        message: "Brief not found",
      });
    }

    // Check if submission deadline has passed and auto-update status
    await validateAndUpdateBriefDates({}, brief);

    // Validate dates for the update
    const { errors, isValid } = await validateAndUpdateBriefDates(updateData);
    if (!isValid) {
      return res.status(400).json({
        code: 400,
        message: "Date validation failed",
        errors: errors,
      });
    }

    // Map request fields to model fields
    const updateModelData = {};
    if (updateData.title) updateModelData.title = updateData.title;
    if (updateData.description !== undefined)
      updateModelData.description = updateData.description;
    if (updateData.is_paid !== undefined)
      updateModelData.isPaid = updateData.is_paid;
    if (updateData.prize_amount !== undefined)
      updateModelData.prizeAmount = updateData.prize_amount;
    if (updateData.submission_deadline)
      updateModelData.submissionDeadline = updateData.submission_deadline;
    if (updateData.voting_start)
      updateModelData.votingStart = updateData.voting_start;
    if (updateData.voting_end)
      updateModelData.votingEnd = updateData.voting_end;
    if (updateData.winner_user_id)
      updateModelData.winnerUserId = updateData.winner_user_id;
    if (updateData.status) updateModelData.status = updateData.status;
    if (updateData.crm_user_id)
      updateModelData.crmUserId = updateData.crm_user_id;
    if (updateData.is_active !== undefined)
      updateModelData.isActive = updateData.is_active;

    // brand_id cannot be changed or removed - it's mandatory
    if (updateData.brand_id !== undefined) {
      return res.status(400).json({
        code: 400,
        message: "Brand ID cannot be changed after brief creation",
      });
    }

    // Update brief
    await brief.update(updateModelData);

    // Update tags if provided
    if (updateData.tags) {
      const tagIds = updateData.tags.map((tag) => tag.id || tag);

      // Validate that all tag IDs exist
      const tags = await Tag.findAll({
        where: { id: { [Op.in]: tagIds } },
      });

      // Check if all requested tags were found
      if (tags.length !== tagIds.length) {
        const foundTagIds = tags.map((tag) => tag.id);
        const missingTagIds = tagIds.filter((id) => !foundTagIds.includes(id));

        return res.status(400).json({
          code: 400,
          message: `The following tag IDs do not exist: ${missingTagIds.join(
            ", "
          )}`,
        });
      }

      // Update brief with tags directly
      await brief.update({ tags: updateData.tags });

      // Notify tag followers about updated brief
      await notifyTagFollowers(brief, tags);
    }

    // Fetch updated brief
    const updatedBrief = await Brief.findByPk(id, {
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name", "logoUrl"] },
      ],
    });

    // Map response to match OpenAPI spec
    const briefResponse = {
      id: updatedBrief.id,
      brand_id: updatedBrief.brandId,
      title: updatedBrief.title,
      description: updatedBrief.description,
      is_paid: updatedBrief.isPaid,
      prize_amount: updatedBrief.prizeAmount,
      submission_deadline: updatedBrief.submissionDeadline,
      voting_start: updatedBrief.votingStart,
      voting_end: updatedBrief.votingEnd,
      winner_user_id: updatedBrief.winnerUserId,
      status: updatedBrief.status,
      crm_user_id: updatedBrief.crmUserId,
      created_at: updatedBrief.createdAt,
      is_active: updatedBrief.isActive,
      files: updatedBrief.files || [],
      tags: updatedBrief.tags || [],
    };

    res.json(briefResponse);
  } catch (error) {
    console.error("Error updating brief:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get briefs by brand
const getBriefsByBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.query;

    const whereClause = { brandId: id };

    if (status) {
      whereClause.status = status;
    }

    // Only filter by isActive if explicitly provided, otherwise get all briefs
    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    const briefs = await Brief.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    const briefsResponse = briefs.map(mapBriefToResponse);

    res.json(briefsResponse);
  } catch (error) {
    console.error("Error fetching briefs by brand:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Create brief for a specific brand (brand_id comes from URL) - FUNCTION_ID: createBriefForBrand
const createBriefForBrand = async (req, res) => {
  try {
    const { id: brandId } = req.params;
    let briefData = req.body;
    let uploadedFiles = [];

    // Debug logging
    console.log("=== createBriefForBrand DEBUG ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Content-Type:", req.headers["content-type"]);

    // Validate brand ID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        brandId
      )
    ) {
      return res.status(400).json({
        code: 400,
        message: "Invalid brand ID format",
      });
    }

    // Verify brand exists
    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      return res.status(404).json({
        code: 404,
        message: "Brand not found",
      });
    }

    // Handle base64 images if provided
    if (briefData.base64_images && Array.isArray(briefData.base64_images)) {
      try {
        // Convert base64 strings to files and upload to S3
        uploadedFiles = await uploadBase64ImagesToS3(
          briefData.base64_images,
          "briefs"
        );
        // Remove base64_images from briefData to avoid storing in database
        delete briefData.base64_images;
      } catch (uploadError) {
        return res.status(500).json({
          code: 500,
          message: "Failed to upload images: " + uploadError.message,
        });
      }
    }

    // Validate required fields according to OpenAPI spec
    if (!briefData || !briefData.title) {
      console.log("=== VALIDATION DEBUG ===");
      console.log("briefData:", briefData);
      console.log("briefData.title:", briefData?.title);
      console.log("typeof briefData:", typeof briefData);
      return res.status(400).json({
        code: 400,
        message: "Title is required",
      });
    }

    // Validate dates and update status if needed
    const { errors, isValid } = await validateAndUpdateBriefDates(briefData);
    if (!isValid) {
      return res.status(400).json({
        code: 400,
        message: "Date validation failed",
        errors: errors,
      });
    }

    // brand_id is automatically set from URL params - no need to validate it
    // Map request fields to model fields
    const briefModelData = {
      title: briefData.title,
      description: briefData.description,
      isPaid: briefData.isPaid,
      prizeAmount: briefData.prizeAmount,
      submissionDeadline: briefData.submissionDeadline,
      votingStart: briefData.votingStart,
      votingEnd: briefData.votingEnd,
      winnerUserId: briefData.winnerUserId,
      status: briefData.status || "submission",
      crmUserId: briefData.crmUserId,
      brandId: brandId, // Use brand ID from URL params
      files: uploadedFiles,
      tags: briefData.tags || [],
    };

    // Create brief
    const brief = await Brief.create(briefModelData);

    // Associate tags if provided and notify followers
    if (briefData.tags && briefData.tags.length > 0) {
      const tagIds = briefData.tags.map((tag) => tag.id || tag);

      // Validate that all tag IDs exist
      const tags = await Tag.findAll({
        where: { id: { [Op.in]: tagIds } },
      });

      // Check if all requested tags were found
      if (tags.length !== tagIds.length) {
        const foundTagIds = tags.map((tag) => tag.id);
        const missingTagIds = tagIds.filter((id) => !foundTagIds.includes(id));

        return res.status(400).json({
          code: 400,
          message: `The following tag IDs do not exist: ${missingTagIds.join(
            ", "
          )}`,
        });
      }

      // Update brief with tags
      await brief.update({ tags: briefData.tags });

      // Notify users who follow these tags
      await notifyTagFollowers(brief, tags);
    }

    // Fetch brief with associations
    const createdBrief = await Brief.findByPk(brief.id, {
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name", "logoUrl"] },
      ],
    });

    // Map response to match OpenAPI spec
    const briefResponse = {
      id: createdBrief.id,
      brand_id: createdBrief.brandId,
      title: createdBrief.title,
      description: createdBrief.description,
      is_paid: createdBrief.isPaid,
      prize_amount: createdBrief.prizeAmount,
      submission_deadline: createdBrief.submissionDeadline,
      voting_start: createdBrief.votingStart,
      voting_end: createdBrief.votingEnd,
      winner_user_id: createdBrief.winnerUserId,
      status: createdBrief.status,
      crm_user_id: createdBrief.crmUserId,
      created_at: createdBrief.createdAt,
      files: createdBrief.files || [],
      tags: createdBrief.tags || [],
    };

    res.status(201).json(briefResponse);
  } catch (error) {
    console.error("Error creating brief for brand:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Get briefs by tag
const getBriefsByTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    // Verify tag exists
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: "Tag not found",
      });
    }

    // Find briefs that contain this tag in their tags JSON array
    const briefs = await Brief.findAll({
      where: {
        tags: {
          [Op.contains]: [{ id: tagId }], // Check if tags array contains this tag
        },
      },
      include: [
        {
          model: Brand,
          as: "brand",
          attributes: ["id", "name", "logoUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Map response to match OpenAPI spec
    const briefsResponse = briefs.map((brief) => ({
      id: brief.id,
      brand_id: brief.brandId,
      title: brief.title,
      description: brief.description,
      is_paid: brief.isPaid,
      prize_amount: brief.prizeAmount,
      submission_deadline: brief.submissionDeadline,
      voting_start: brief.votingStart,
      voting_end: brief.votingEnd,
      winner_user_id: brief.winnerUserId,
      status: brief.status,
      crm_user_id: brief.crmUserId,
      created_at: brief.createdAt,
      files: brief.files || [],
      tags: brief.tags
        ? brief.tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            description: tag.description,
            created_at: tag.createdAt,
            updated_at: tag.updatedAt,
          }))
        : [],
    }));

    res.json(briefsResponse);
  } catch (error) {
    console.error("Error fetching briefs by tag:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

// Notify tag followers about new brief
const notifyTagFollowers = async (brief, tags) => {
  try {
    // Extract tag IDs from the tags array
    const tagIds = tags.map((tag) => tag.id || tag);

    // Find all users who follow any of these tags
    const { User } = require("../models");
    const followers = await User.findAll({
      where: {
        followedTags: {
          [Op.overlap]: tagIds, // Check if user's followedTags overlaps with brief tags
        },
        isActive: true, // Only notify active users
        isVerified: true, // Only notify verified users
      },
      attributes: ["id", "email", "username", "displayName", "followedTags"],
    });

    if (followers.length > 0) {
      // Group followers by which tags they follow
      const tagFollowersMap = new Map();

      followers.forEach((user) => {
        const userFollowedTags = user.followedTags || [];
        const relevantTags = tags.filter((tag) =>
          userFollowedTags.includes(tag.id || tag)
        );

        if (relevantTags.length > 0) {
          relevantTags.forEach((tag) => {
            if (!tagFollowersMap.has(tag.id)) {
              tagFollowersMap.set(tag.id, []);
            }
            tagFollowersMap.get(tag.id).push(user);
          });
        }
      });

      // Send notifications for each tag
      for (const [tagId, tagUsers] of tagFollowersMap) {
        const tag = tags.find((t) => (t.id || t) === tagId);
        if (tag && tagUsers.length > 0) {
          await sendBriefNotification(tagUsers, brief, tag);
        }
      }
    }
  } catch (error) {
    console.error("Error notifying tag followers:", error);
    // Don't fail the request if notification fails
  }
};

// Function to automatically update brief statuses
const autoUpdateBriefStatuses = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all briefs that are in "submission" status and have submission deadline passed
    const expiredBriefs = await Brief.findAll({
      where: {
        status: "submission",
        submissionDeadline: {
          [Op.lte]: today,
        },
      },
    });

    if (expiredBriefs.length > 0) {
      console.log(
        `Found ${expiredBriefs.length} briefs with expired submission deadlines`
      );

      for (const brief of expiredBriefs) {
        await brief.update({ status: "in_review" });
        console.log(
          `Brief ${brief.id} status automatically changed from submission to in_review`
        );
      }
    }

    return { updated: expiredBriefs.length };
  } catch (error) {
    console.error("Error auto-updating brief statuses:", error);
    throw error;
  }
};

module.exports = {
  createBriefForBrand,
  getBriefs,
  getBriefById,
  getBriefsByBrand,
  updateBrief,
  getBriefsByTag,
  notifyTagFollowers,
  autoUpdateBriefStatuses,
};
