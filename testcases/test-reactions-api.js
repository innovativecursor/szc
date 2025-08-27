const axios = require("axios");

const API_BASE_URL = "http://localhost:3000";

// Test data
const testData = {
  user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  submission_id: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
  reaction: "like",
};

// Helper function to log results
const logResult = (testName, success, data = null, error = null) => {
  const status = success ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} ${testName}`);
  if (data) {
    console.log(`   Response:`, JSON.stringify(data, null, 2));
  }
  if (error) {
    console.log(`   Error:`, error.message || error);
  }
  console.log("");
};

// Test functions
const testGetAllReactions = async () => {
  try {
    console.log("🧪 Testing GET /api/reactions (Get all reactions)...");
    const response = await axios.get(`${API_BASE_URL}/api/reactions`);
    logResult("GET /api/reactions", true, response.data);
    return true;
  } catch (error) {
    logResult("GET /api/reactions", false, null, error.response?.data || error);
    return false;
  }
};

const testGetReactionsBySubmission = async () => {
  try {
    console.log("🧪 Testing GET /api/reactions/submission/{submission_id}...");
    const response = await axios.get(
      `${API_BASE_URL}/api/reactions/submission/${testData.submission_id}`
    );
    logResult(
      "GET /api/reactions/submission/{submission_id}",
      true,
      response.data
    );
    return true;
  } catch (error) {
    logResult(
      "GET /api/reactions/submission/{submission_id}",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testCreateReaction = async () => {
  try {
    console.log("🧪 Testing POST /api/reactions/submission/{submission_id}...");
    const response = await axios.post(
      `${API_BASE_URL}/api/reactions/submission/${testData.submission_id}`,
      {
        user_id: testData.user_id,
        reaction: testData.reaction,
      }
    );
    logResult(
      "POST /api/reactions/submission/{submission_id}",
      true,
      response.data
    );

    // Store the created reaction ID for later tests
    if (response.data && response.data.id) {
      testData.reaction_id = response.data.id;
    }

    return true;
  } catch (error) {
    logResult(
      "POST /api/reactions/submission/{submission_id}",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testGetReactionById = async () => {
  if (!testData.reaction_id) {
    console.log(
      "⚠️  Skipping GET /api/reactions/{reaction_id} - no reaction ID available"
    );
    return false;
  }

  try {
    console.log("🧪 Testing GET /api/reactions/{reaction_id}...");
    const response = await axios.get(
      `${API_BASE_URL}/api/reactions/${testData.reaction_id}`
    );
    logResult("GET /api/reactions/{reaction_id}", true, response.data);
    return true;
  } catch (error) {
    logResult(
      "GET /api/reactions/{reaction_id}",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testUpdateReaction = async () => {
  if (!testData.reaction_id) {
    console.log(
      "⚠️  Skipping PATCH /api/reactions/{reaction_id} - no reaction ID available"
    );
    return false;
  }

  try {
    console.log("🧪 Testing PATCH /api/reactions/{reaction_id}...");
    const response = await axios.patch(
      `${API_BASE_URL}/api/reactions/${testData.reaction_id}`,
      {
        reaction: "love",
      }
    );
    logResult("PATCH /api/reactions/{reaction_id}", true, response.data);
    return true;
  } catch (error) {
    logResult(
      "PATCH /api/reactions/{reaction_id}",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

const testDeleteReaction = async () => {
  if (!testData.reaction_id) {
    console.log(
      "⚠️  Skipping DELETE /api/reactions/{reaction_id} - no reaction ID available"
    );
    return false;
  }

  try {
    console.log("🧪 Testing DELETE /api/reactions/{reaction_id}...");
    const response = await axios.delete(
      `${API_BASE_URL}/api/reactions/${testData.reaction_id}`
    );
    logResult(
      "DELETE /api/reactions/{reaction_id}",
      true,
      "Reaction deleted successfully"
    );
    return true;
  } catch (error) {
    logResult(
      "DELETE /api/reactions/{reaction_id}",
      false,
      null,
      error.response?.data || error
    );
    return false;
  }
};

// Test with different reaction types
const testDifferentReactionTypes = async () => {
  const reactionTypes = ["like", "love", "wow", "haha", "sad", "angry"];

  console.log("🧪 Testing different reaction types...");

  for (const reactionType of reactionTypes) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/reactions/submission/${testData.submission_id}`,
        {
          user_id: testData.user_id,
          reaction: reactionType,
        }
      );
      console.log(`   ✅ ${reactionType}: Created successfully`);
    } catch (error) {
      console.log(
        `   ❌ ${reactionType}: Failed - ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
  console.log("");
};

// Test validation errors
const testValidationErrors = async () => {
  console.log("🧪 Testing validation errors...");

  // Test with invalid UUID
  try {
    await axios.get(`${API_BASE_URL}/api/reactions/submission/invalid-uuid`);
    console.log("   ❌ Should have failed with invalid UUID");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("   ✅ Invalid UUID correctly rejected");
    } else {
      console.log("   ❌ Unexpected error for invalid UUID");
    }
  }

  // Test with invalid reaction type
  try {
    await axios.post(
      `${API_BASE_URL}/api/reactions/submission/${testData.submission_id}`,
      {
        user_id: testData.user_id,
        reaction: "invalid_reaction",
      }
    );
    console.log("   ❌ Should have failed with invalid reaction type");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("   ✅ Invalid reaction type correctly rejected");
    } else {
      console.log("   ❌ Unexpected error for invalid reaction type");
    }
  }

  // Test with missing required fields
  try {
    await axios.post(
      `${API_BASE_URL}/api/reactions/submission/${testData.submission_id}`,
      {
        user_id: testData.user_id,
        // Missing reaction field
      }
    );
    console.log("   ❌ Should have failed with missing reaction field");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("   ✅ Missing reaction field correctly rejected");
    } else {
      console.log("   ❌ Unexpected error for missing reaction field");
    }
  }

  console.log("");
};

// Main test runner
const runTests = async () => {
  console.log("🚀 Starting Reactions API Tests");
  console.log("=================================");
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Test User ID: ${testData.user_id}`);
  console.log(`Test Submission ID: ${testData.submission_id}`);
  console.log("");

  const results = [];

  // Run all tests
  results.push(await testGetAllReactions());
  results.push(await testGetReactionsBySubmission());
  results.push(await testCreateReaction());
  results.push(await testGetReactionById());
  results.push(await testUpdateReaction());
  results.push(await testDeleteReaction());

  // Test different reaction types
  await testDifferentReactionTypes();

  // Test validation errors
  await testValidationErrors();

  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log("📊 Test Results Summary");
  console.log("=======================");
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log("🎉 All tests passed!");
  } else {
    console.log("💥 Some tests failed. Check the output above for details.");
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testData,
};
