const sequelize = require("../config/database");

async function up() {
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
    console.error("Error creating reactions table:", error);
    throw error;
  }
}

async function down() {
  try {
    await sequelize.query("DROP TABLE IF EXISTS reactions");
    console.log("Successfully dropped reactions table");
  } catch (error) {
    console.error("Error dropping reactions table:", error);
    throw error;
  }
}

if (require.main === module) {
  up()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { up, down };
