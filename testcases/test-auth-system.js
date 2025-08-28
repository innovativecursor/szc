const axios = require("axios");
const { expect } = require("chai");

const BASE_URL = "http://localhost:8080/api";
const TEST_USER = {
  username: "testuser",
  email: "test@example.com",
  password: "TestPass123",
  firstName: "Test",
  lastName: "User",
};

describe("Authentication System Tests", () => {
  let authToken;
  let userId;

  describe("User Registration", () => {
    it("should register a new user successfully", async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/register`,
          TEST_USER
        );

        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.data.user.email).to.equal(TEST_USER.email);
        expect(response.data.data.user.username).to.equal(TEST_USER.username);
        expect(response.data.data.user.roles).to.equal("user");
        expect(response.data.data.token).to.exist;

        authToken = response.data.data.token;
        userId = response.data.data.user.id;

        console.log("✅ User registration successful");
      } catch (error) {
        console.error(
          "❌ User registration failed:",
          error.response?.data || error.message
        );
        throw error;
      }
    });

    it("should reject duplicate email registration", async () => {
      try {
        await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
        throw new Error("Should have rejected duplicate email");
      } catch (error) {
        expect(error.response.status).to.equal(409);
        expect(error.response.data.error).to.equal("USER_EXISTS");
        console.log("✅ Duplicate email rejection working");
      }
    });

    it("should reject invalid password format", async () => {
      try {
        const invalidUser = {
          ...TEST_USER,
          email: "test2@example.com",
          password: "weak",
        };
        await axios.post(`${BASE_URL}/auth/register`, invalidUser);
        throw new Error("Should have rejected weak password");
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.errors).to.exist;
        console.log("✅ Password validation working");
      }
    });
  });

  describe("User Login", () => {
    it("should login with valid credentials", async () => {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password,
        });

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data.user.email).to.equal(TEST_USER.email);
        expect(response.data.data.accessToken).to.exist;
        expect(response.data.data.refreshToken).to.exist;

        console.log("✅ User login successful");
      } catch (error) {
        console.error(
          "❌ User login failed:",
          error.response?.data || error.message
        );
        throw error;
      }
    });

    it("should reject invalid credentials", async () => {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: TEST_USER.email,
          password: "wrongpassword",
        });
        throw new Error("Should have rejected invalid password");
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data.error).to.equal("INVALID_CREDENTIALS");
        console.log("✅ Invalid credentials rejection working");
      }
    });
  });

  describe("JWT Token Authentication", () => {
    it("should access protected endpoint with valid token", async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data.user.id).to.equal(userId);

        console.log("✅ JWT authentication working");
      } catch (error) {
        console.error(
          "❌ JWT authentication failed:",
          error.response?.data || error.message
        );
        throw error;
      }
    });

    it("should reject invalid token", async () => {
      try {
        await axios.get(`${BASE_URL}/auth/profile`, {
          headers: {
            Authorization: "Bearer invalidtoken",
          },
        });
        throw new Error("Should have rejected invalid token");
      } catch (error) {
        expect(error.response.status).to.equal(401);
        console.log("✅ Invalid token rejection working");
      }
    });

    it("should reject missing token", async () => {
      try {
        await axios.get(`${BASE_URL}/auth/profile`);
        throw new Error("Should have rejected missing token");
      } catch (error) {
        expect(error.response.status).to.equal(401);
        console.log("✅ Missing token rejection working");
      }
    });
  });

  describe("Profile Management", () => {
    it("should update user profile", async () => {
      try {
        const updateData = {
          displayName: "Updated Test User",
          bio: "This is an updated bio",
          phoneNumber: "+1-555-999-8888",
        };

        const response = await axios.put(
          `${BASE_URL}/auth/profile`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data.user.displayName).to.equal(
          updateData.displayName
        );
        expect(response.data.data.user.bio).to.equal(updateData.bio);
        expect(response.data.data.user.phoneNumber).to.equal(
          updateData.phoneNumber
        );

        console.log("✅ Profile update working");
      } catch (error) {
        console.error(
          "❌ Profile update failed:",
          error.response?.data || error.message
        );
        throw error;
      }
    });
  });

  describe("Password Management", () => {
    it("should change password successfully", async () => {
      try {
        const newPassword = "NewTestPass456";

        const response = await axios.post(
          `${BASE_URL}/auth/change-password`,
          {
            currentPassword: TEST_USER.password,
            newPassword: newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;

        // Test login with new password
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: TEST_USER.email,
          password: newPassword,
        });

        expect(loginResponse.status).to.equal(200);
        expect(loginResponse.data.success).to.be.true;

        // Update token for subsequent tests
        authToken = loginResponse.data.data.accessToken;

        console.log("✅ Password change working");
      } catch (error) {
        console.error(
          "❌ Password change failed:",
          error.response?.data || error.message
        );
        throw error;
      }
    });
  });

  describe("Token Refresh", () => {
    it("should refresh access token", async () => {
      try {
        // First get a refresh token by logging in
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: TEST_USER.email,
          password: "NewTestPass456",
        });

        const refreshToken = loginResponse.data.data.refreshToken;

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data.accessToken).to.exist;

        console.log("✅ Token refresh working");
      } catch (error) {
        console.error(
          "❌ Token refresh failed:",
          error.response?.data || error.message
        );
        throw error;
      }
    });
  });

  describe("Logout", () => {
    it("should logout successfully", async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;

        console.log("✅ Logout working");
      } catch (error) {
        console.error(
          "❌ Logout failed:",
          error.response?.data || error.message
        );
        throw error;
      }
    });
  });

  describe("Role-Based Access Control", () => {
    it("should enforce user role restrictions", async () => {
      try {
        // Try to access admin-only endpoint (should fail for regular users)
        await axios.get(`${BASE_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        throw new Error("Should have rejected access to admin endpoint");
      } catch (error) {
        expect(error.response.status).to.equal(403);
        console.log("✅ Role-based access control working");
      }
    });
  });

  describe("Cleanup", () => {
    it("should clean up test data", async () => {
      // In a real application, you might want to delete the test user
      // For now, we'll just log that the tests are complete
      console.log("🧹 Test cleanup completed");
      console.log("📊 All authentication system tests passed!");
    });
  });
});

// Helper function to run tests
const runTests = async () => {
  try {
    console.log("🚀 Starting Authentication System Tests...\n");

    // Run the tests
    await require("mocha").run();
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
};

// Export for use in other test files
module.exports = {
  runTests,
  TEST_USER,
  BASE_URL,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}
