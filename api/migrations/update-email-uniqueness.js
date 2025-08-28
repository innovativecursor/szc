const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the unique constraint on email column
    await queryInterface.removeConstraint("users", "users_email_key");

    // Add composite unique constraint for email + roles
    await queryInterface.addConstraint("users", {
      fields: ["email", "roles"],
      type: "unique",
      name: "users_email_role_unique",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the composite unique constraint
    await queryInterface.removeConstraint("users", "users_email_role_unique");

    // Restore the unique constraint on email column
    await queryInterface.addConstraint("users", {
      fields: ["email"],
      type: "unique",
      name: "users_email_key",
    });
  },
};
