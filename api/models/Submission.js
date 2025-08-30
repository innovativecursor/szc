const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Submission = sequelize.define(
  "Submission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    briefId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "briefs",
        key: "id",
      },
      field: "brief_id",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      field: "user_id",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    files: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidFilesArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Files must be an array");
          }
          value.forEach((file) => {
            if (
              !file.id ||
              !file.filename ||
              !file.size ||
              !file.type ||
              !file.url ||
              !file.hash
            ) {
              throw new Error(
                "Each file must have id, filename, size, type, url, and hash"
              );
            }
          });
        },
      },
    },
    isFinalist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_finalist",
    },
    isWinner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_winner",
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    // Additional fields for internal use
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    concept: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("submitted", "in_review", "winner"),
      defaultValue: "submitted",
    },
    submissionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    estimatedHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "submissions",
    timestamps: true,
    // Map createdAt to created_at for API response
    createdAt: "created_at",
    updatedAt: "updated_at",
    // Ensure one submission per user per brief
    indexes: [
      {
        unique: true,
        fields: ["brief_id", "user_id"],
        name: "unique_user_brief_submission",
      },
    ],
    hooks: {
      afterCreate: async (submission, options) => {
        await updateBriefParticipants(
          submission.briefId,
          "add",
          submission.userId
        );
      },
      afterUpdate: async (submission, options) => {
        // Always update participants to ensure they're current
        await updateBriefParticipants(
          submission.briefId,
          "add",
          submission.userId
        );

        // If user ID changed, also remove from old brief
        if (submission.changed("userId")) {
          const previousUserId = submission._previousDataValues?.userId;
          if (previousUserId) {
            await updateBriefParticipants(
              submission._previousDataValues.briefId,
              "remove",
              previousUserId
            );
          }
        }
      },
      afterDestroy: async (submission, options) => {
        await updateBriefParticipants(
          submission.briefId,
          "remove",
          submission.userId
        );
      },
    },
  }
);

// Helper function to update brief participants
async function updateBriefParticipants(briefId, action, userId) {
  try {
    console.log("updateBriefParticipants called:", { briefId, action, userId });

    // Use sequelize.models to avoid circular dependency
    const sequelize = require("../config/database");
    const Brief = sequelize.models.Brief;
    const User = sequelize.models.User;

    // Get the brief
    const brief = await Brief.findByPk(briefId);
    if (!brief) {
      console.log("Brief not found:", briefId);
      return;
    }
    console.log("Found brief:", brief.title);

    // Get user details
    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "firstName", "lastName", "email"],
    });
    if (!user) {
      console.log("User not found:", userId);
      return;
    }
    console.log("Found user:", user.username);

    const userParticipation = {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      participatedAt: new Date(),
    };

    let participants = brief.participants || [];
    console.log("Current participants:", participants);

    if (action === "add") {
      // Check if user already exists in participants
      const existingIndex = participants.findIndex((p) => p.userId === userId);
      if (existingIndex === -1) {
        participants.push(userParticipation);
        console.log("Added user to participants:", user.username);
      } else {
        // Update existing participation
        participants[existingIndex] = userParticipation;
        console.log("Updated user participation:", user.username);
      }
    } else if (action === "remove") {
      participants = participants.filter((p) => p.userId !== userId);
      console.log("Removed user from participants:", user.username);
    }

    console.log("New participants array:", participants);

    // Update the brief using raw SQL to ensure JSON is properly handled
    await sequelize.query(
      `
      UPDATE briefs 
      SET participants = ? 
      WHERE id = ?
    `,
      {
        replacements: [JSON.stringify(participants), briefId],
      }
    );

    console.log("Updated brief participants:", {
      action,
      userId,
      participantsCount: participants.length,
    });
  } catch (error) {
    console.error("Error updating brief participants:", error);
  }
}

module.exports = Submission;
