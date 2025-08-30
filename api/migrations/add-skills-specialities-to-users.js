const sequelize = require("../config/database");

const addSkillsSpecialitiesToUsers = async () => {
  try {
    console.log(
      "Starting migration: Adding skills and top_specialities to users table..."
    );

    // Add skills column
    try {
      await sequelize.query(`
        ALTER TABLE users
        ADD COLUMN skills JSON
        COMMENT 'Array of user skills'
      `);
      console.log("Skills column added successfully");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("Skills column already exists");
      } else {
        throw error;
      }
    }

    // Add top_specialities column
    try {
      await sequelize.query(`
        ALTER TABLE users
        ADD COLUMN top_specialities JSON
        COMMENT 'Array of user top specialities'
      `);
      console.log("Top specialities column added successfully");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("Top specialities column already exists");
      } else {
        throw error;
      }
    }

    // Set default empty arrays for existing users
    try {
      await sequelize.query(`
        UPDATE users
        SET skills = '[]', top_specialities = '[]'
        WHERE skills IS NULL OR top_specialities IS NULL
      `);
      console.log("Default values set for existing users");
    } catch (error) {
      console.log("Note: Could not set default values:", error.message);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  addSkillsSpecialitiesToUsers()
    .then(() => {
      console.log("Migration completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { addSkillsSpecialitiesToUsers };
