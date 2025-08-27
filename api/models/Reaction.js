const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reaction = sequelize.define(
  "Reaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "submissions",
        key: "id",
      },
      field: "submission_id",
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
    portfolioId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "portfolios",
        key: "id",
      },
      field: "portfolio_id",
    },
    type: {
      type: DataTypes.ENUM("like", "vote"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "reactions",
    timestamps: false, // Only created_at, no updated_at
    indexes: [
      {
        unique: true,
        fields: ["id"],
      },
    ],
  }
);

module.exports = Reaction;
