const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "google_id", {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      after: "social_links",
    });

    // Add index for better performance
    await queryInterface.addIndex("users", ["google_id"], {
      unique: true,
      name: "users_google_id_unique",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex("users", "users_google_id_unique");

    // Remove column
    await queryInterface.removeColumn("users", "google_id");
  },
};
