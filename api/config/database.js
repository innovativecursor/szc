const { Sequelize } = require("sequelize");
const { getDatabaseConfig } = require("./configLoader");

// Get database configuration
const getDBConfig = () => {
  try {
    const config = getDatabaseConfig();
    // Parse database URL to extract components
    const dbUrl = config.url;

    // For MySQL connection string format: mysql://username:password@host:port/database
    if (dbUrl.startsWith("mysql://")) {
      const urlParts = dbUrl.replace("mysql://", "").split("@");
      const credentials = urlParts[0].split(":");
      const hostPort = urlParts[1].split("/");
      const hostPortParts = hostPort[0].split(":");

      return {
        database: hostPort[1] || "skillzcollab",
        username: credentials[0] || "root",
        password: credentials[1] || "root",
        host: hostPortParts[0] || "localhost",
        port: hostPortParts[1] || 3306,
        dialect: "mysql",
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        retry: {
          max: 3,
          timeout: 5000,
        },
      };
    }

    // For PostgreSQL connection string format: postgres://username:password@host:port/database
    if (dbUrl.startsWith("postgres://")) {
      const urlParts = dbUrl.replace("postgres://", "").split("@");
      const credentials = urlParts[0].split(":");
      const hostPort = urlParts[1].split("/");
      const hostPortParts = hostPort[0].split(":");

      return {
        database: hostPort[1] || "skillzcollab",
        username: credentials[0] || "postgres",
        password: credentials[1] || "postgres",
        host: hostPortParts[0] || "localhost",
        port: hostPortParts[1] || 5432,
        dialect: "postgres",
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        retry: {
          max: 3,
          timeout: 5000,
        },
      };
    }

    throw new Error("Unsupported database URL format");
  } catch (error) {
    console.error("Error loading database configuration:", error);
    // Fallback to environment variables if config loading fails
    return {
      database: process.env.DB_NAME || "skillzcollab",
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      retry: {
        max: 3,
        timeout: 5000,
      },
    };
  }
};

// Database configuration
const dbConfig = getDBConfig();

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
    // Removed automatic sync to prevent index creation issues
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log("1. Make sure MySQL is running");
    console.log("2. Check if database 'skillzcollab' exists");
    console.log("3. Verify username and password in api/config/database.js");
    console.log("4. Or set environment variables:");
    console.log("   - DB_NAME=skillzcollab");
    console.log("   - DB_USER=root");
    console.log("   - DB_PASSWORD=root");
    console.log("   - DB_HOST=localhost");
    console.log("   - DB_PORT=3306");

    // For trial run, you can continue without database connection
    console.log(
      "\n⚠️  For trial run, you can continue without database connection"
    );
    console.log("   The API will work but database operations will fail.");
  }
};

// Test connection on startup
testConnection();

module.exports = sequelize;
