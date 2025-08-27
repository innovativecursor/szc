const User = require("./User");
const Brand = require("./Brand");
const Brief = require("./Brief");
const Tag = require("./Tag");
const Submission = require("./Submission");
const Reaction = require("./Reaction");
const Portfolio = require("./Portfolio");
const Creative = require("./Creative");

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasOne(Brand, { foreignKey: "userId", as: "brandProfile" });
  User.hasMany(Portfolio, { foreignKey: "userId", as: "portfolios" });
  User.hasMany(Submission, { foreignKey: "creativeId", as: "submissions" });
  User.hasMany(Reaction, { foreignKey: "userId", as: "reactions" });
  // Removed User.hasMany(Tag) association since creatorId field was removed

  // Brand associations
  Brand.hasMany(Brief, { foreignKey: "brandId", as: "briefs" });

  // Brief associations
  Brief.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });
  Brief.hasMany(Submission, { foreignKey: "briefId", as: "submissions" });
  // Tags are now stored directly in Brief model as JSON array, no association needed

  // Submission associations
  Submission.belongsTo(Brief, { foreignKey: "briefId", as: "brief" });
  Submission.belongsTo(User, { foreignKey: "creativeId", as: "creative" });
  Submission.belongsTo(Submission, {
    foreignKey: "parentSubmissionId",
    as: "parentSubmission",
  });
  Submission.hasMany(Submission, {
    foreignKey: "parentSubmissionId",
    as: "revisions",
  });
  Submission.hasMany(Reaction, { foreignKey: "submissionId", as: "reactions" });

  // Reaction associations
  Reaction.belongsTo(User, { foreignKey: "userId", as: "user" });
  Reaction.belongsTo(Submission, {
    foreignKey: "submissionId",
    as: "submission",
  });
  Reaction.belongsTo(Portfolio, { foreignKey: "portfolioId", as: "portfolio" });

  // Portfolio associations
  Portfolio.belongsTo(User, { foreignKey: "userId", as: "user" });
  Portfolio.hasMany(Creative, { foreignKey: "portfolioId", as: "creatives" });
  Portfolio.hasMany(Reaction, { foreignKey: "portfolioId", as: "reactions" });

  // Creative associations
  Creative.belongsTo(Portfolio, { foreignKey: "portfolioId", as: "portfolio" });
};

// Initialize associations
defineAssociations();

module.exports = {
  User,
  Brand,
  Brief,
  Tag,
  Submission,
  Reaction,
  Portfolio,
  Creative,
  sequelize: require("../config/database"),
};
