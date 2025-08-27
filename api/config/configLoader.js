const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Global config variable
let config = null;

// Load configuration from YAML file
const loadConfig = () => {
  if (config) {
    return config;
  }

  try {
    const configPath = path.join(process.cwd(), "config", "config.yaml");

    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found at: ${configPath}`);
    }

    const configFile = fs.readFileSync(configPath, "utf8");
    config = yaml.load(configFile);

    // Validate required configuration sections
    validateConfig(config);

    return config;
  } catch (error) {
    console.error("Error loading configuration:", error);
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
};

// Validate configuration structure
const validateConfig = (config) => {
  const requiredSections = ["env", "server", "storage", "auth", "logging"];

  for (const section of requiredSections) {
    if (!config[section]) {
      throw new Error(`Missing required configuration section: ${section}`);
    }
  }

  // Validate server configuration
  if (!config.server.port || !config.server.host) {
    throw new Error("Server configuration must include port and host");
  }

  // Validate storage configuration
  if (!config.storage.database || !config.storage.database.url) {
    throw new Error("Storage configuration must include database URL");
  }

  // Validate auth configuration
  if (!config.auth.jwt || !config.auth.jwt.signing_key) {
    throw new Error("Auth configuration must include JWT signing key");
  }
};

// Get server configuration
const getServerConfig = () => {
  const config = loadConfig();
  return config.server;
};

// Get database configuration
const getDatabaseConfig = () => {
  const config = loadConfig();
  return config.storage.database;
};

// Get object storage configuration
const getObjectStorageConfig = () => {
  const config = loadConfig();
  return config.storage.object_storage;
};

// Get authentication configuration
const getAuthConfig = () => {
  const config = loadConfig();
  return config.auth;
};

// Get JWT configuration
const getJWTConfig = () => {
  const config = loadConfig();
  return config.auth.jwt;
};

// Get OAuth configuration
const getOAuthConfig = () => {
  const config = loadConfig();
  return config.auth.oauth;
};

// Get Basic Auth configuration
const getBasicAuthConfig = () => {
  const config = loadConfig();
  return config.auth.basic_auth;
};

// Get RBAC configuration
const getRBACConfig = () => {
  const config = loadConfig();
  return config.auth.rbac;
};

// Get logging configuration
const getLoggingConfig = () => {
  const config = loadConfig();
  return config.logging;
};

// Get CORS configuration
const getCORSConfig = () => {
  const config = loadConfig();
  return config.server.cors;
};

// Get file upload configuration
const getFileUploadConfig = () => {
  const config = loadConfig();
  return config.server.file_upload;
};

// Get environment configuration
const getEnvironmentConfig = () => {
  const config = loadConfig();
  return config.env;
};

// Check if configuration is loaded
const isConfigLoaded = () => {
  return config !== null;
};

// Reload configuration (useful for testing or hot reloading)
const reloadConfig = () => {
  config = null;
  return loadConfig();
};

// Get configuration value by path (e.g., 'auth.jwt.signing_key')
const getConfigValue = (path) => {
  const config = loadConfig();
  const keys = path.split(".");
  let value = config;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
};

// Get all configuration
const getAllConfig = () => {
  return loadConfig();
};

// Export configuration as environment variables
const exportAsEnvVars = () => {
  const config = loadConfig();
  const envVars = {};

  const flattenObject = (obj, prefix = "") => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix
          ? `${prefix}_${key.toUpperCase()}`
          : key.toUpperCase();

        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          flattenObject(obj[key], newKey);
        } else {
          envVars[newKey] = obj[key];
        }
      }
    }
  };

  flattenObject(config);
  return envVars;
};

module.exports = {
  loadConfig,
  getServerConfig,
  getDatabaseConfig,
  getObjectStorageConfig,
  getAuthConfig,
  getJWTConfig,
  getOAuthConfig,
  getBasicAuthConfig,
  getRBACConfig,
  getLoggingConfig,
  getCORSConfig,
  getFileUploadConfig,
  getEnvironmentConfig,
  isConfigLoaded,
  reloadConfig,
  getConfigValue,
  getAllConfig,
  exportAsEnvVars,
};
