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
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // Remove unique constraint - now allows same email for different roles
      validate: {
        // Custom email validation to preserve dots
        is: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true, // Allow null for OAuth users
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
        // Custom email validation to preserve dots
        is: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      field: "social_links",
    },
    googleId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      field: "google_id",
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
    indexes: [
      // Composite unique index for email + role combination
      {
        unique: true,
        fields: ["email", "roles"],
        name: "users_email_role_unique",
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        // Hash password if provided and not already hashed
        if (user.password && !user.password.startsWith("$2a$")) {
          user.password = await bcrypt.hash(user.password, 10);
        }

        // Super admin constraints
        if (user.roles === "super_admin") {
          // Check if super admin already exists
          const existingSuperAdmin = await sequelize.models.User.findOne({
            where: { roles: "super_admin" },
          });

          if (existingSuperAdmin) {
            throw new Error("Only one super admin can exist in the system");
          }
        }

        // Admin verification constraints
        if (user.roles === "admin") {
          // Admins must be verified by super admin (except during seeding)
          if (!user.isVerified && !process.env.SEEDING_SUPER_ADMIN) {
            throw new Error(
              "Admin users must be verified by super admin before access"
            );
          }
        }
      },
      beforeUpdate: async (user) => {
        // Hash password if changed and not already hashed
        if (
          user.changed("password") &&
          user.password &&
          !user.password.startsWith("$2a$")
        ) {
          user.password = await bcrypt.hash(user.password, 10);
        }

        // Prevent role changes to super_admin
        if (user.changed("roles") && user.roles === "super_admin") {
          const existingSuperAdmin = await sequelize.models.User.findOne({
            where: {
              roles: "super_admin",
              id: { [sequelize.Sequelize.Op.ne]: user.id },
            },
          });

          if (existingSuperAdmin) {
            throw new Error("Only one super admin can exist in the system");
          }
        }

        // Prevent admin from being verified by non-super admin
        if (
          user.changed("isVerified") &&
          user.roles === "admin" &&
          user.isVerified
        ) {
          // This will be checked in the controller/middleware
          // to ensure only super admin can verify admins
        }
      },
    },
  }
);

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false; // OAuth users don't have passwords
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
