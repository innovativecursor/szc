const { Sequelize } = require("sequelize");

// Simple database configuration with environment variable support
const sequelize = new Sequelize({
  database: process.env.DB_NAME || "skillzcollab",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // Add timeout settings to prevent hanging
  timeout: 60000, // 60 seconds
  retry: {
    max: 3,
    timeout: 5000,
  },
});

// Test connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
    console.log(
      `📊 Connected to: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "skillzcollab"}`
    );
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n🔧 Quick fixes:");
    console.log("1. Make sure MySQL is running: sudo systemctl status mysql");
    console.log(
      "2. Check if database exists: mysql -u root -p -e 'SHOW DATABASES;'"
    );
    console.log(
      "3. Create database if needed: mysql -u root -p -e 'CREATE DATABASE IF NOT EXISTS skillzcollab;'"
    );
    console.log(
      "4. Check environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME"
    );
    return false;
  }
};

// Export both the sequelize instance and test function
module.exports = sequelize;
module.exports.testConnection = testConnection;
