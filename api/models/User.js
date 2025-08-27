const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "display_name",
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
    profileImageURL: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "profile_image_url",
    },
    portfolioURL: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "portfolio_url",
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "phone_number",
    },
    alternateEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "alternate_email",
      validate: {
        isEmail: true,
      },
    },
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      field: "social_links",
    },
    roles: {
      type: DataTypes.ENUM("super_admin", "admin", "user"),
      defaultValue: "user",
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    followedTags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: "followed_tags",
      comment: "Array of tag IDs that the user follows for notifications",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
