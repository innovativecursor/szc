const { Sequelize } = require("sequelize");

const runGoogleIdMigration = async () => {
  let sequelize;

  try {
    console.log("🚀 Starting Google ID migration...");

    // Create a new Sequelize instance with explicit configuration
    sequelize = new Sequelize({
      database: "skillzcollab",
      username: "root",
      password: "root",
      host: "localhost",
      port: 3306,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 60000, // Increased timeout
        idle: 10000,
      },
      retry: {
        max: 5, // Increased retry attempts
        timeout: 10000, // Increased timeout
      },
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // Check if google_id column already exists
    const [columns] = await sequelize.query(
      "SHOW COLUMNS FROM users LIKE 'google_id'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      console.log("📝 Adding google_id column to users table...");

      // Add google_id column
      await sequelize.query(
        "ALTER TABLE users ADD COLUMN google_id VARCHAR(100) NULL AFTER id"
      );
      console.log("✅ Added google_id column to users table");

      // Add unique index for better performance
      await sequelize.query(
        "CREATE UNIQUE INDEX users_google_id_unique ON users(google_id)"
      );
      console.log("✅ Added unique index on google_id column");
    } else {
      console.log("ℹ️  google_id column already exists");
    }

    console.log("🎉 Google ID migration completed successfully!");

    // Verify the column exists
    const allColumns = await sequelize.query("SHOW COLUMNS FROM users", {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log("\n📋 Current users table columns:");
    if (Array.isArray(allColumns)) {
      allColumns.forEach((col) => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log("  - Could not retrieve column information");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n🔧 Connection refused. Please check:");
      console.log("1. Is MySQL running?");
      console.log("2. Is the port 3306 accessible?");
      console.log("3. Are the credentials correct?");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n🔧 Access denied. Please check:");
      console.log("1. Username: root");
      console.log("2. Password: root");
      console.log("3. Database: skillzcollab");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.log("\n🔧 Database not found. Please check:");
      console.log("1. Database 'skillzcollab' exists");
      console.log("2. Run: CREATE DATABASE skillzcollab;");
    }

    throw error;
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log("🔌 Database connection closed");
    }
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runGoogleIdMigration()
    .then(() => {
      console.log("\n✨ Google ID migration process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration process failed:", error.message);
      process.exit(1);
    });
}

module.exports = { runGoogleIdMigration };
