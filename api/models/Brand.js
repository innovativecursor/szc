const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Brand = sequelize.define(
  "Brand",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contactEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      field: "contact_email",
    },
    logoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      // validate: {
      //   isUrl: true,
      // },
      field: "logo_url",
    },
    websiteUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      // validate: {
      //   isUrl: true,
      // },
      field: "website_url",
    },
    registeredOffice: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: "registered_office",
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "address",
    },
    businessField: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "business_field",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "brands",
    timestamps: false, // Custom timestamps
    // Removed explicit indexes to reduce total index count
  }
);

module.exports = Brand;
