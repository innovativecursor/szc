const sequelize = require("../config/database");

async function runMigration() {
  try {
    console.log("Starting migration...");

    // Add likes column to submissions table
    try {
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN likes INT DEFAULT 0"
      );
      console.log("Added likes column to submissions table");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("likes column already exists");
      } else {
        throw error;
      }
    }

    // Add votes column to submissions table
    try {
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN votes INT DEFAULT 0"
      );
      console.log("Added votes column to submissions table");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("votes column already exists");
      } else {
        throw error;
      }
    }

    // Add created_at column to submissions table
    try {
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      );
      console.log("Added created_at column to submissions table");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("created_at column already exists");
      } else {
        throw error;
      }
    }

    // Add updated_at column to submissions table
    try {
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      );
      console.log("Added updated_at column to submissions table");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("updated_at column already exists");
      } else {
        throw error;
      }
    }

    // Create reactions table
    try {
      await sequelize.query(`
        CREATE TABLE reactions (
          id VARCHAR(36) PRIMARY KEY,
          submission_id VARCHAR(36) NOT NULL,
          user_id VARCHAR(36) NOT NULL,
          reaction ENUM('like', 'vote') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_submission_reaction (user_id, submission_id, reaction)
        )
      `);
      console.log("Successfully created reactions table with indexes");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("reactions table already exists");
      } else {
        throw error;
      }
    }

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
