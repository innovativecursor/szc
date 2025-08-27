const { sequelize } = require("../models");

const initializeDatabase = async () => {
  try {
    // Sync all models with the database
    // force: true will drop existing tables and recreate them (use with caution in production)
    // alter: true will attempt to alter existing tables to match the model definitions
    await sequelize.sync({ alter: true });

    console.log("Database synchronized successfully");

    // You can add seed data here if needed
    // await seedDatabase();
  } catch (error) {
    console.error("Error synchronizing database:", error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    // Add initial data here if needed
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Database initialization completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database initialization failed:", error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase, seedDatabase };
