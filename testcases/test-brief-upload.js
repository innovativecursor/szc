const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Test brief creation with multipart/form-data
async function testBriefCreationWithFiles() {
  try {
    console.log("Testing brief creation with multipart/form-data...");

    // Create form data
    const form = new FormData();

    // Add brief data as JSON string
    const briefData = {
      title: "Creative Design Brief for Brand Campaign",
      description:
        "We need a creative design for our new brand campaign. Looking for innovative and modern designs.",
      is_paid: true,
      prize_amount: 5000,
      submission_deadline: "2025-02-15T23:59:59Z",
      voting_start: "2025-02-16T00:00:00Z",
      voting_end: "2025-02-20T23:59:59Z",
      status: "draft",
      crm_user_id: "00000000-0000-0000-0000-000000000000",
    };

    form.append("brief", JSON.stringify(briefData));

    // Add sample files (if they exist)
    const sampleFiles = [
      "sample-image.png",
      "sample-logo.jpg",
      "brand-guidelines.pdf",
    ];

    for (const fileName of sampleFiles) {
      const filePath = path.join(__dirname, fileName);
      if (fs.existsSync(filePath)) {
        form.append("files", fs.createReadStream(filePath));
        console.log(`Added file: ${fileName}`);
      }
    }

    // Make the request
    const response = await axios.post(
      "http://localhost:8080/api/briefs",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log("✅ Brief created successfully!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      "❌ Error creating brief:",
      error.response?.data || error.message
    );
  }
}

// Test brief creation without files (JSON only)
async function testBriefCreationJSON() {
  try {
    console.log("\nTesting brief creation with JSON only...");

    const briefData = {
      title: "Simple Text Brief",
      description: "A simple brief without any file attachments.",
      is_paid: false,
      status: "draft",
    };

    const response = await axios.post(
      "http://localhost:8080/api/briefs",
      briefData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Brief created successfully (JSON)!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      "❌ Error creating brief (JSON):",
      error.response?.data || error.message
    );
  }
}

// Test file validation
async function testFileValidation() {
  try {
    console.log("\nTesting file validation...");

    const form = new FormData();

    const briefData = {
      title: "Test Brief for File Validation",
      description: "Testing file upload validation.",
      status: "draft",
    };

    form.append("brief", JSON.stringify(briefData));

    // Try to upload an invalid file type (text file)
    const invalidFile = Buffer.from("This is a text file, not an image");
    form.append("files", invalidFile, {
      filename: "test.txt",
      contentType: "text/plain",
    });

    const response = await axios.post(
      "http://localhost:8080/api/briefs",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    console.log("✅ File validation test completed!");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ File validation working correctly - rejected invalid file type"
      );
    } else {
      console.error(
        "❌ Unexpected error in file validation test:",
        error.response?.data || error.message
      );
    }
  }
}

// Main test function
async function runTests() {
  console.log("🚀 Starting Brief Creation Tests...\n");

  // Test 1: Brief creation with files
  await testBriefCreationWithFiles();

  // Test 2: Brief creation without files
  await testBriefCreationJSON();

  // Test 3: File validation
  await testFileValidation();

  console.log("\n✨ All tests completed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testBriefCreationWithFiles,
  testBriefCreationJSON,
  testFileValidation,
  runTests,
};
