const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Creative = sequelize.define(
  "Creative",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    files: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "creatives",
    timestamps: false, // Only created_at, no updated_at
    indexes: [
      {
        unique: true,
        fields: ["id"],
      },
    ],
  }
);

module.exports = Creative;
