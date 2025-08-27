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
  }
);

module.exports = Submission;
