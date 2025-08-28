require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const routes = require("./api/routes");
// const fs = require("fs");
// const path = require("path");
const cors = require("cors");
var cookieParser = require("cookie-parser");
const sequelize = require("./api/config/database");
const compression = require("compression"); // Add this line
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./api/swagger/swagger.json");
const { handleUploadError } = require("./api/middleware/uploadMiddleware");

const app = express();

app.use(compression({ level: 9 })); // Used to compress API responses

// Allow CORS from anywhere
app.use(
  cors({
    origin: "*",
    credentials: false, // Set to false when origin is "*"
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
      "X-File-Name",
    ],
    exposedHeaders: ["Content-Length", "Content-Range", "X-Total-Count"],
  })
);
// Use your options object you defined above
app.use(
  bodyParser.urlencoded({
    extended: false,
    parameterLimit: 100000,
    limit: "5120mb",
  })
);

app.use(express.json({ limit: "5120mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));

// Swagger UI setup
app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "SkillzCollab API Documentation",
  })
);

// simple route
app.use("/", routes);

// Test database connection and sync models
(async () => {
  try {
    // Test connection first
    const { testConnection } = require("./api/config/database");
    const isConnected = await testConnection();

    if (isConnected) {
      // Only sync if connection is successful
      await sequelize.sync({ alter: false, force: false });
      console.log("✅ Database tables synchronized successfully.");
    } else {
      console.log("⚠️  Skipping database sync due to connection failure");
    }
  } catch (error) {
    console.error("❌ Database sync error:", error.message);
  }
})();

module.exports = app;
