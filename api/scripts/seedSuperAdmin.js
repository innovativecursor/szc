const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { loadConfig } = require("../config/configLoader");

// Set environment variable to bypass password hashing hook
process.env.SEEDING_SUPER_ADMIN = "true";

const seedSuperAdmin = async () => {
  try {
    console.log("Starting Super Admin seeding...");

    const config = loadConfig();

    const existingSuperAdmin = await User.findOne({
      where: { roles: "super_admin" },
    });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists, skipping...");
      return;
    }

    const superAdminData = {
      username: "superadmin",
      email: "superadmin@skillzcollab.com",
      password: "SuperAdmin@2024",
      firstName: "Super",
      lastName: "Administrator",
      displayName: "Super Administrator",
      roles: "super_admin",
      isVerified: true,
      isActive: true,
      isSuperAdmin: true,
    };

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      superAdminData.password,
      saltRounds
    );

    const superAdmin = await User.create({
      ...superAdminData,
      password: hashedPassword,
    });

    console.log("Super Admin created successfully!");
    console.log("Email:", superAdmin.email);
    console.log("Username:", superAdmin.username);
    console.log("Password:", superAdminData.password);
    console.log("IMPORTANT: Change this password in production!");
    console.log("User ID:", superAdmin.id);
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
    throw error;
  }
};

if (require.main === module) {
  seedSuperAdmin()
    .then(() => {
      console.log("Super Admin seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Super Admin seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedSuperAdmin };
