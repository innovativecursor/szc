const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add likes column
      await queryInterface.addColumn("submissions", "likes", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });

      // Add votes column
      await queryInterface.addColumn("submissions", "votes", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });

      console.log(
        "✅ Successfully added likes and votes columns to submissions table"
      );

      // Add created_at column
      await queryInterface.addColumn("submissions", "created_at", {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      });

      // Add updated_at column
      await queryInterface.addColumn("submissions", "updated_at", {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      });

      console.log(
        "✅ Successfully added created_at and updated_at columns to submissions table"
      );
    } catch (error) {
      console.error("❌ Error adding columns:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove likes column
      await queryInterface.removeColumn("submissions", "likes");

      // Remove votes column
      await queryInterface.removeColumn("submissions", "votes");

      console.log(
        "✅ Successfully removed likes and votes columns from submissions table"
      );

      // Remove created_at column
      await queryInterface.removeColumn("submissions", "created_at");

      // Remove updated_at column
      await queryInterface.removeColumn("submissions", "updated_at");

      console.log(
        "✅ Successfully removed created_at and updated_at columns from submissions table"
      );
    } catch (error) {
      console.error("❌ Error removing columns:", error);
      throw error;
    }
  },
};
