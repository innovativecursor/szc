const { loadConfig } = require("../config/configLoader");
const sequelize = require("../config/database");

async function runMigration() {
  try {
    console.log("Database connection successful");

    // Check current constraints
    const [constraints] = await sequelize.query(
      "SELECT CONSTRAINT_NAME, COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'skillzcollab' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email'"
    );

    console.log("Current email constraints:", constraints);

    // Remove unique constraint on email if it exists
    for (const constraint of constraints) {
      if (
        constraint.CONSTRAINT_NAME.includes("UNIQUE") ||
        constraint.CONSTRAINT_NAME.includes("unique")
      ) {
        await sequelize.query(
          `ALTER TABLE users DROP INDEX ${constraint.CONSTRAINT_NAME}`
        );
        console.log("Removed unique constraint on email");
      }
    }

    if (constraints.length === 0) {
      console.log("No existing email unique constraint found");
    }

    // Add composite unique constraint for email + roles
    try {
      await sequelize.query(
        "ALTER TABLE users ADD CONSTRAINT users_email_role_unique UNIQUE (email, roles)"
      );
      console.log("Added composite unique constraint");
    } catch (error) {
      if (error.message.includes("Duplicate key name")) {
        console.log("Composite unique constraint already exists");
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
