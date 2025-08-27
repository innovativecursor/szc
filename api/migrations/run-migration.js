const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

const runMigration = async () => {
  try {
    console.log("🚀 Starting database migration...");

    // Check if columns already exist
    const columns = await sequelize.query(
      "SHOW COLUMNS FROM submissions LIKE 'likes'",
      { type: QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      // Add likes column
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN likes INT NOT NULL DEFAULT 0"
      );
      console.log("✅ Added likes column to submissions table");
    } else {
      console.log("ℹ️  likes column already exists");
    }

    const votesColumns = await sequelize.query(
      "SHOW COLUMNS FROM submissions LIKE 'votes'",
      { type: QueryTypes.SELECT }
    );

    if (votesColumns.length === 0) {
      // Add votes column
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN votes INT NOT NULL DEFAULT 0"
      );
      console.log("✅ Added votes column to submissions table");
    } else {
      console.log("ℹ️  votes column already exists");
    }

    // Check and add created_at column
    const createdAtColumns = await sequelize.query(
      "SHOW COLUMNS FROM submissions LIKE 'created_at'",
      { type: QueryTypes.SELECT }
    );

    if (createdAtColumns.length === 0) {
      // Add created_at column
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      );
      console.log("✅ Added created_at column to submissions table");
    } else {
      console.log("ℹ️  created_at column already exists");
    }

    // Check and add updated_at column
    const updatedAtColumns = await sequelize.query(
      "SHOW COLUMNS FROM submissions LIKE 'updated_at'",
      { type: QueryTypes.SELECT }
    );

    if (updatedAtColumns.length === 0) {
      // Add updated_at column
      await sequelize.query(
        "ALTER TABLE submissions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      );
      console.log("✅ Added updated_at column to submissions table");
    } else {
      console.log("ℹ️  updated_at column already exists");
    }

    console.log("🎉 Submissions table migration completed!");

    // Check and create reactions table
    console.log("");
    console.log("🔍 Checking reactions table...");

    const reactionsTable = await sequelize.query(
      "SHOW TABLES LIKE 'reactions'",
      { type: QueryTypes.SELECT }
    );

    if (reactionsTable.length === 0) {
      // Create reactions table
      await sequelize.query(`
        CREATE TABLE reactions (
          id CHAR(36) PRIMARY KEY,
          submission_id CHAR(36) NOT NULL,
          user_id CHAR(36) NOT NULL,
          reaction ENUM('like', 'love', 'wow', 'haha', 'sad', 'angry') NOT NULL DEFAULT 'like',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE KEY unique_user_submission_reaction (submission_id, user_id),
          INDEX idx_reactions_submission_id (submission_id),
          INDEX idx_reactions_user_id (user_id)
        )
      `);
      console.log("✅ Successfully created reactions table with indexes");
    } else {
      console.log("ℹ️  reactions table already exists");
    }

    console.log("");
    console.log("🎉 All migrations completed successfully!");

    // Verify the submissions columns exist
    const allColumns = await sequelize.query("SHOW COLUMNS FROM submissions", {
      type: QueryTypes.SELECT,
    });

    console.log("\n📋 Current submissions table columns:");
    allColumns.forEach((col) => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log("\n✨ Migration process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration process failed:", error);
      process.exit(1);
    });
}

module.exports = { runMigration };
