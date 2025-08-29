const sequelize = require("../config/database");

async function runMigration() {
  try {
    console.log("Starting Google ID migration...");

    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully");

    // Check if google_id column already exists
    const [columns] = await sequelize.query(
      "SHOW COLUMNS FROM users LIKE 'google_id'"
    );

    if (columns.length === 0) {
      // Add google_id column
      await sequelize.query(
        "ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"
      );
      console.log("Added google_id column to users table");

      // Add unique index on google_id column
      try {
        await sequelize.query(
          "ALTER TABLE users ADD UNIQUE INDEX idx_google_id (google_id)"
        );
        console.log("Added unique index on google_id column");
      } catch (error) {
        if (error.message.includes("Duplicate key name")) {
          console.log("Unique index on google_id already exists");
        } else {
          throw error;
        }
      }
    } else {
      console.log("google_id column already exists");
    }

    console.log("Google ID migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Google ID migration failed:", error);
    process.exit(1);
  }
}

runMigration();
