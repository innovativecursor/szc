const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Test data
const testBriefId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const testUserId = "3fa85f64-5717-4562-b3fc-2c963f66afa7";

async function testSubmissionAPI() {
  console.log("🧪 Testing Submission API...\n");

  try {
    // Test 1: Get submissions by brief ID (nested route)
    console.log("1. Testing GET /briefs/{brief_id}/submissions");
    try {
      const response = await axios.get(
        `${BASE_URL}/briefs/${testBriefId}/submissions`
      );
      console.log("✅ Success:", response.status);
      console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log("❌ Error:", error.response.status, error.response.data);
      } else {
        console.log("❌ Network Error:", error.message);
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Create a new submission using nested route (brief_id in URL)
    console.log("2. Testing POST /briefs/{brief_id}/submissions");
    const submissionData = {
      user_id: testUserId,
      description: "Test submission description",
      files: [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa8",
          filename: "test-image.png",
          size: 1024,
          type: "image/png",
          url: "https://example.com/test-image.png",
          hash: "abc123hash",
        },
      ],
    };

    let createdSubmissionId = null;
    try {
      const response = await axios.post(
        `${BASE_URL}/briefs/${testBriefId}/submissions`,
        submissionData
      );
      console.log("✅ Success:", response.status);
      console.log("Response:", JSON.stringify(response.data, null, 2));
      createdSubmissionId = response.data.id;
    } catch (error) {
      if (error.response) {
        console.log("❌ Error:", error.response.status, error.response.data);
      } else {
        console.log("❌ Network Error:", error.message);
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 3: Get individual submission by brief ID and submission ID
    if (createdSubmissionId) {
      console.log(
        "3. Testing GET /briefs/{brief_id}/submissions/{submission_id}"
      );
      try {
        const response = await axios.get(
          `${BASE_URL}/briefs/${testBriefId}/submissions/${createdSubmissionId}`
        );
        console.log("✅ Success:", response.status);
        console.log("Response:", JSON.stringify(response.data, null, 2));
      } catch (error) {
        if (error.response) {
          console.log("❌ Error:", error.response.status, error.response.data);
        } else {
          console.log("❌ Network Error:", error.message);
        }
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 4: Update submission using nested route
    if (createdSubmissionId) {
      console.log(
        "4. Testing PATCH /briefs/{brief_id}/submissions/{submission_id}"
      );
      const updateData = {
        description: "Updated description via nested route",
        is_finalist: true,
        likes: 5,
        votes: 10,
      };

      try {
        const response = await axios.patch(
          `${BASE_URL}/briefs/${testBriefId}/submissions/${createdSubmissionId}`,
          updateData
        );
        console.log("✅ Success:", response.status);
        console.log("Response:", JSON.stringify(response.data, null, 2));
      } catch (error) {
        if (error.response) {
          console.log("❌ Error:", error.response.status, error.response.data);
        } else {
          console.log("❌ Network Error:", error.message);
        }
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 5: Create a new submission using legacy route (brief_id in body)
    console.log("5. Testing POST /submissions (legacy route)");
    const legacySubmissionData = {
      brief_id: testBriefId,
      user_id: testUserId,
      description: "Legacy route submission",
      files: [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa9",
          filename: "legacy-image.png",
          size: 2048,
          type: "image/png",
          url: "https://example.com/legacy-image.png",
          hash: "def456hash",
        },
      ],
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/submissions`,
        legacySubmissionData
      );
      console.log("✅ Success:", response.status);
      console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log("❌ Error:", error.response.status, error.response.data);
      } else {
        console.log("❌ Network Error:", error.message);
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 6: Get all submissions
    console.log("6. Testing GET /submissions");
    try {
      const response = await axios.get(`${BASE_URL}/submissions`);
      console.log("✅ Success:", response.status);
      console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log("❌ Error:", error.response.status, error.response.data);
      } else {
        console.log("❌ Network Error:", error.message);
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 7: Get submissions by brief ID again to see new submissions
    console.log(
      "7. Testing GET /briefs/{brief_id}/submissions (after creation)"
    );
    try {
      const response = await axios.get(
        `${BASE_URL}/briefs/${testBriefId}/submissions`
      );
      console.log("✅ Success:", response.status);
      console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log("❌ Error:", error.response.status, error.response.data);
      } else {
        console.log("❌ Network Error:", error.message);
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 8: Delete submission using nested route
    if (createdSubmissionId) {
      console.log(
        "8. Testing DELETE /briefs/{brief_id}/submissions/{submission_id}"
      );
      try {
        const response = await axios.delete(
          `${BASE_URL}/briefs/${testBriefId}/submissions/${createdSubmissionId}`
        );
        console.log("✅ Success:", response.status);
        console.log("Response: No content (204)");
      } catch (error) {
        if (error.response) {
          console.log("❌ Error:", error.response.status, error.response.data);
        } else {
          console.log("❌ Network Error:", error.message);
        }
      }
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run tests
testSubmissionAPI();
