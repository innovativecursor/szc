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

const options = {
  credentials: true,
  origin: ["http://localhost:3000", "http://localhost:3004"],
};
app.use(cors(options));
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

// Sync models with the database
(async () => {
  try {
    await sequelize.sync({ alter: false, force: false });
    console.log("✅ Database tables synchronized successfully.");
  } catch (error) {
    console.error("❌ Unable to sync database:", error);
    console.log("⚠️  Server will start but database operations may fail.");
  }
})();

module.exports = app;
