const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Brief = sequelize.define(
  "Brief",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    brandId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "brands",
        key: "id",
      },
      field: "brand_id",
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: "is_paid",
    },
    prizeAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "prize_amount",
    },
    submissionDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "submission_deadline",
    },
    votingStart: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "voting_start",
    },
    votingEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "voting_end",
    },
    winnerUserId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "winner_user_id",
    },
    status: {
      type: DataTypes.ENUM("submission", "in_review", "winner"),
      defaultValue: "submission",
    },
    crmUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "crm_user_id",
    },
    files: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of tag objects associated with this brief",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
      comment: "Whether the brief is active and visible to users",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "briefs",
    timestamps: false, // Custom timestamps
    // Removed explicit indexes to reduce total index count
  }
);

module.exports = Brief;
