const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Create reactions table
      await queryInterface.createTable("reactions", {
        id: {
          type: DataTypes.CHAR(36),
          primaryKey: true,
          allowNull: false,
        },
        submission_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: "submissions",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        user_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        reaction: {
          type: DataTypes.ENUM("like", "love", "wow", "haha", "sad", "angry"),
          allowNull: false,
          defaultValue: "like",
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });

      // Add indexes
      await queryInterface.addIndex("reactions", ["submission_id", "user_id"], {
        unique: true,
        name: "unique_user_submission_reaction",
      });

      await queryInterface.addIndex("reactions", ["submission_id"], {
        name: "idx_reactions_submission_id",
      });

      await queryInterface.addIndex("reactions", ["user_id"], {
        name: "idx_reactions_user_id",
      });

      console.log("✅ Successfully created reactions table with indexes");
    } catch (error) {
      console.error("❌ Error creating reactions table:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop reactions table
      await queryInterface.dropTable("reactions");
      console.log("✅ Successfully dropped reactions table");
    } catch (error) {
      console.error("❌ Error dropping reactions table:", error);
      throw error;
    }
  },
};
