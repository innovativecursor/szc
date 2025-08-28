const axios = require("axios");

const BASE_URL = "http://localhost:8080";
const API_BASE_URL = `${BASE_URL}/api`;

// Test data storage
const testData = {
  user: {
    username: "testuser_cascade",
    email: "testuser_cascade@example.com",
    password: "TestPass123!",
    firstName: "Test",
    lastName: "User",
    role: "user",
  },
  admin: {
    username: "testadmin_cascade",
    email: "testadmin_cascade@example.com",
    password: "TestPass123!",
    firstName: "Test",
    lastName: "Admin",
    role: "admin",
  },
  brand: {
    name: "Test Brand Cascade",
    contact_email: "brand_cascade@example.com",
    registered_office: "Test Office",
    address: "Test Address",
    business_field: "Technology",
    logo_url: "https://example.com/logo.png",
    website_url: "https://example.com",
  },
  brief: {
    title: "Test Brief Cascade",
    description: "Test brief for cascade deletion testing",
    requirements: "Test requirements",
    budget: 1000,
    deadline: "2024-12-31",
    status: "submission",
  },
  submission: {
    description: "Test submission for cascade deletion testing",
    files: [
      {
        id: "cascade-test-file-1",
        filename: "test-file-1.png",
        size: 1024,
        type: "image/png",
        url: "https://example.com/test-file-1.png",
        hash: "cascade-test-hash-1",
      },
    ],
  },
  reactions: [{ reaction: "like" }, { reaction: "love" }, { reaction: "wow" }],
};

let authToken = null;
let adminToken = null;
let brandId = null;
let briefId = null;
let submissionId = null;
let reactionIds = [];

// Helper function to log results
const logResult = (testName, success, data = null, error = null) => {
  if (success) {
    console.log(`✅ ${testName}: SUCCESS`);
    if (data) console.log("Response:", JSON.stringify(data, null, 2));
  } else {
    console.log(`❌ ${testName}: FAILED`);
    if (error) console.log("Error:", JSON.stringify(error, null, 2));
  }
  console.log("-".repeat(50));
};

// Test functions
const testUserRegistration = async () => {
  console.log("🧪 Testing user registration...");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      testData.user
    );
    logResult("User Registration", true, response.data);
    return true;
  } catch (error) {
    logResult("User Registration", false, null, error.response?.data || error);
    return false;
  }
};

const testAdminRegistration = async () => {
  console.log("🧪 Testing admin registration...");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      testData.admin
    );
    logResult("Admin Registration", true, response.data);
    return true;
  } catch (error) {
    logResult("Admin Registration", false, null, error.response?.data || error);
    return false;
  }
};

const testUserLogin = async () => {
  console.log("🧪 Testing user login...");
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testData.user.email,
      password: testData.user.password,
    });
    authToken = response.data.accessToken;
    logResult("User Login", true, response.data);
    return true;
  } catch (error) {
    logResult("User Login", false, null, error.response?.data || error);
    return false;
  }
};

const testAdminLogin = async () => {
  console.log("🧪 Testing admin login...");
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testData.admin.email,
      password: testData.admin.password,
    });
    adminToken = response.data.accessToken;
    logResult("Admin Login", true, response.data);
    return true;
  } catch (error) {
    logResult("Admin Login", false, null, error.response?.data || error);
    return false;
  }
};

const testCreateBrand = async () => {
  console.log("🧪 Testing brand creation...");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/brands`,
      testData.brand,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    brandId = response.data.id;
    logResult("Brand Creation", true, response.data);
    return true;
  } catch (error) {
    logResult("Brand Creation", false, null, error.response?.data || error);
    return false;
  }
};

const testCreateBrief = async () => {
  console.log("🧪 Testing brief creation...");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/brands/${brandId}/briefs`,
      testData.brief,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    briefId = response.data.id;
    logResult("Brief Creation", true, response.data);
    return true;
  } catch (error) {
    logResult("Brief Creation", false, null, error.response?.data || error);
    return false;
  }
};

const testCreateSubmission = async () => {
  console.log("🧪 Testing submission creation...");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/briefs/${briefId}/submissions`,
      testData.submission,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    submissionId = response.data.id;
    logResult("Submission Creation", true, response.data);
    return true;
  } catch (error) {
    logResult(
      "Submission Creation",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testCreateReactions = async () => {
  console.log("🧪 Testing reaction creation...");
  try {
    for (const reactionData of testData.reactions) {
      const response = await axios.post(
        `${API_BASE_URL}/reactions/submission/${submissionId}`,
        reactionData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      reactionIds.push(response.data.id);
      console.log(
        `✅ Created reaction: ${reactionData.reaction} (ID: ${response.data.id})`
      );
    }
    logResult("Reactions Creation", true, {
      count: reactionIds.length,
      reactions: reactionIds,
    });
    return true;
  } catch (error) {
    logResult("Reactions Creation", false, null, error.response?.data || error);
    return false;
  }
};

const testVerifyReactionsExist = async () => {
  console.log("🧪 Testing that reactions exist before deletion...");
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reactions/submission/${submissionId}`
    );
    const reactions = response.data;
    console.log(
      `✅ Found ${reactions.length} reactions for submission ${submissionId}`
    );
    reactions.forEach((reaction) => {
      console.log(
        `  - Reaction ID: ${reaction.id}, Type: ${reaction.reaction}, User: ${reaction.user_id}`
      );
    });
    logResult("Reactions Verification", true, { count: reactions.length });
    return reactions.length > 0;
  } catch (error) {
    logResult(
      "Reactions Verification",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testDeleteSubmission = async () => {
  console.log("🧪 Testing submission deletion...");
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/briefs/${briefId}/submissions/${submissionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    logResult("Submission Deletion", true, { status: response.status });
    return true;
  } catch (error) {
    logResult(
      "Submission Deletion",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testVerifyReactionsDeleted = async () => {
  console.log(
    "🧪 Testing that reactions are deleted after submission deletion..."
  );
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reactions/submission/${submissionId}`
    );
    const reactions = response.data;
    if (reactions.length === 0) {
      logResult("Reactions Deletion Verification", true, {
        message: "All reactions successfully deleted",
      });
      return true;
    } else {
      logResult("Reactions Deletion Verification", false, {
        message: `Found ${reactions.length} reactions that should have been deleted`,
        reactions: reactions,
      });
      return false;
    }
  } catch (error) {
    // If the submission doesn't exist, reactions should also not exist
    if (error.response?.status === 404) {
      logResult("Reactions Deletion Verification", true, {
        message: "Submission and reactions not found (as expected)",
      });
      return true;
    }
    logResult(
      "Reactions Deletion Verification",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testVerifySubmissionDeleted = async () => {
  console.log("🧪 Testing that submission is deleted...");
  try {
    const response = await axios.get(
      `${API_BASE_URL}/briefs/${briefId}/submissions/${submissionId}`
    );
    logResult("Submission Deletion Verification", false, {
      message: "Submission still exists",
    });
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      logResult("Submission Deletion Verification", true, {
        message: "Submission successfully deleted",
      });
      return true;
    }
    logResult(
      "Submission Deletion Verification",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

// Main test function
const testCascadeDeletion = async () => {
  console.log("🚀 Starting Cascade Deletion Tests");
  console.log("=".repeat(60));

  try {
    // Setup phase
    console.log("📋 SETUP PHASE");
    console.log("-".repeat(30));

    const results = [];
    results.push(await testUserRegistration());
    results.push(await testAdminRegistration());
    results.push(await testUserLogin());
    results.push(await testAdminLogin());
    results.push(await testCreateBrand());
    results.push(await testCreateBrief());
    results.push(await testCreateSubmission());
    results.push(await testCreateReactions());

    // Verify reactions exist
    const reactionsExist = await testVerifyReactionsExist();
    if (!reactionsExist) {
      console.log(
        "⚠️  Cannot proceed with cascade deletion test - no reactions exist"
      );
      return;
    }

    console.log("\n" + "=".repeat(60));
    console.log("🧪 CASCADE DELETION TEST PHASE");
    console.log("-".repeat(30));

    // Test cascade deletion
    results.push(await testDeleteSubmission());
    results.push(await testVerifyReactionsDeleted());
    results.push(await testVerifySubmissionDeleted());

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("-".repeat(30));

    const passed = results.filter(Boolean).length;
    const total = results.length;
    const successRate = ((passed / total) * 100).toFixed(1);

    console.log(`✅ Passed: ${passed}/${total} (${successRate}%)`);

    if (passed === total) {
      console.log(
        "🎉 All tests passed! Cascade deletion is working correctly."
      );
    } else {
      console.log("❌ Some tests failed. Check the logs above for details.");
    }
  } catch (error) {
    console.error("💥 Test suite failed:", error.message);
  }
};

// Run tests
testCascadeDeletion();
