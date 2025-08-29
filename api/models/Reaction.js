const { DataTypes } = require("sequelize");

const Reaction = (sequelize) => {
  const Reaction = sequelize.define(
    "Reaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      submissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "submission_id",
        references: {
          model: "submissions",
          key: "id",
        },
        onDelete: "CASCADE", // Ensure reactions are deleted when submission is deleted
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      reaction: {
        type: DataTypes.ENUM("like", "vote"),
        allowNull: true,
        // defaultValue: "like",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
    },
    {
      tableName: "reactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["submission_id", "user_id"],
          name: "unique_user_submission_reaction",
        },
        {
          fields: ["submission_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    }
  );

  return Reaction;
};

module.exports = Reaction;
