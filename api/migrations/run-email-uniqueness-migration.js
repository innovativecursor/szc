const { Sequelize } = require("sequelize");
const config = require("../config/database");

async function runMigration() {
  try {
    console.log("🔄 Starting email uniqueness migration...");

    // Test database connection
    await config.authenticate();
    console.log("✅ Database connection successful");

    // Check if the unique constraint on email exists
    console.log("🔄 Checking existing constraints...");
    const [constraints] = await config.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND CONSTRAINT_TYPE = 'UNIQUE'
      AND CONSTRAINT_NAME = 'users_email_key'
    `);

    // Remove unique constraint on email if it exists
    if (constraints.length > 0) {
      console.log("🔄 Removing unique constraint on email column...");
      await config.query("ALTER TABLE users DROP INDEX users_email_key");
      console.log("✅ Removed unique constraint on email");
    } else {
      console.log("ℹ️  No existing email unique constraint found");
    }

    // Check if the composite unique constraint already exists
    const [compositeConstraints] = await config.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND CONSTRAINT_TYPE = 'UNIQUE'
      AND CONSTRAINT_NAME = 'users_email_role_unique'
    `);

    // Add composite unique constraint for email + roles if it doesn't exist
    if (compositeConstraints.length === 0) {
      console.log("🔄 Adding composite unique constraint for email + roles...");
      await config.query(`
        ALTER TABLE users 
        ADD CONSTRAINT users_email_role_unique 
        UNIQUE (email, roles)
      `);
      console.log("✅ Added composite unique constraint");
    } else {
      console.log("ℹ️  Composite unique constraint already exists");
    }

    console.log("🎉 Email uniqueness migration completed successfully!");
    console.log("\n📋 Summary of changes:");
    console.log("- Removed unique constraint on email column");
    console.log(
      "- Added composite unique constraint for email + roles combination"
    );
    console.log("- Users can now have the same email for different roles");
    console.log("- Usernames remain unique across all roles");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("\n🔧 Troubleshooting tips:");
    console.error("1. Make sure the database is running");
    console.error("2. Check if the users table exists");
    console.error("3. Verify database connection settings");
    console.error("4. Check if you have sufficient permissions");
    console.error("5. Ensure you have ALTER TABLE privileges");
  } finally {
    process.exit(0);
  }
}

// Run the migration
runMigration();
