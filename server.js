require("dotenv").config();

const http = require("http");
const { loadConfig } = require("./api/config/configLoader");

// Load configuration
const config = loadConfig();
const port = config.server.port || 8080;

const { app, syncDatabase } = require("./app");
const server = http.createServer(app);

// Sync database tables
syncDatabase()
  .then(() => {
    // Start server after database sync
    app.listen(port, () => {
      console.log(`SkillzCollab API server is running on port ${port}`);
      console.log(`Health Check: http://localhost:${port}/health`);
    });
  })
  .catch((error) => {
    console.error("Failed to sync database:", error);
    // Start server anyway
    app.listen(port, () => {
      console.log(`SkillzCollab API server is running on port ${port}`);
      console.log(`Health Check: http://localhost:${port}/health`);
    });
  });

// Handle server errors
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
