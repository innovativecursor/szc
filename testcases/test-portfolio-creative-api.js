const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE_URL = "http://localhost:3000";

// Test data (placeholders)
const testData = {
  user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  portfolio_id: null, // Will be set after creation
  creative_id: null, // Will be set after creation
};

// Helper function to create a dummy test file
const createTestFile = () => {
  const testFilePath = path.join(__dirname, "test-image.png");
  if (!fs.existsSync(testFilePath)) {
    // Create a simple 1x1 PNG file
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xff, 0xff, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    fs.writeFileSync(testFilePath, pngHeader);
    console.log("✅ Created test-image.png");
  }
  return testFilePath;
};

// Test Portfolio APIs
const testPortfolioAPIs = async () => {
  console.log("\n🎨 Testing Portfolio APIs...");

  try {
    // Test 1: Get all portfolios
    console.log("\n1️⃣ Testing GET /api/portfolios");
    const allPortfoliosResponse = await axios.get(
      `${API_BASE_URL}/api/portfolios`
    );
    console.log(
      "✅ GET /api/portfolios successful:",
      allPortfoliosResponse.data.length,
      "portfolios found"
    );

    // Test 2: Get portfolios by user
    console.log("\n2️⃣ Testing GET /api/portfolios/users/{user_id}");
    const userPortfoliosResponse = await axios.get(
      `${API_BASE_URL}/api/portfolios/users/${testData.user_id}`
    );
    console.log(
      "✅ GET /api/portfolios/users/{user_id} successful:",
      userPortfoliosResponse.data.length,
      "portfolios found"
    );

    // Test 3: Create portfolio for user
    console.log("\n3️⃣ Testing POST /api/portfolios/users/{user_id}");
    const formData = new FormData();
    formData.append("title", "Test Portfolio");
    formData.append("description", "A test portfolio for API testing");

    const testFilePath = createTestFile();
    formData.append("files", fs.createReadStream(testFilePath));

    const createPortfolioResponse = await axios.post(
      `${API_BASE_URL}/api/portfolios/users/${testData.user_id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    console.log("✅ POST /api/portfolios/users/{user_id} successful");
    testData.portfolio_id = createPortfolioResponse.data.id;
    console.log("📝 Portfolio ID:", testData.portfolio_id);

    // Test 4: Get specific portfolio
    console.log(
      "\n4️⃣ Testing GET /api/portfolios/users/{user_id}/{portfolio_id}"
    );
    const portfolioResponse = await axios.get(
      `${API_BASE_URL}/api/portfolios/users/${testData.user_id}/${testData.portfolio_id}`
    );
    console.log(
      "✅ GET /api/portfolios/users/{user_id}/{portfolio_id} successful"
    );
    console.log("📝 Portfolio title:", portfolioResponse.data.title);

    // Test 5: Update portfolio
    console.log(
      "\n5️⃣ Testing PATCH /api/portfolios/users/{user_id}/{portfolio_id}"
    );
    const updateFormData = new FormData();
    updateFormData.append("title", "Updated Test Portfolio");
    updateFormData.append("description", "Updated description for testing");

    const updatePortfolioResponse = await axios.patch(
      `${API_BASE_URL}/api/portfolios/users/${testData.user_id}/${testData.portfolio_id}`,
      updateFormData,
      {
        headers: {
          ...updateFormData.getHeaders(),
        },
      }
    );
    console.log(
      "✅ PATCH /api/portfolios/users/{user_id}/{portfolio_id} successful"
    );
    console.log("📝 Updated title:", updatePortfolioResponse.data.title);
  } catch (error) {
    console.error(
      "❌ Portfolio API test failed:",
      error.response?.data || error.message
    );
  }
};

// Test Creative APIs
const testCreativeAPIs = async () => {
  console.log("\n🎭 Testing Creative APIs...");

  if (!testData.portfolio_id) {
    console.log("⚠️  Skipping Creative tests - no portfolio ID available");
    return;
  }

  try {
    // Test 1: Get all creatives
    console.log("\n1️⃣ Testing GET /api/creatives");
    const allCreativesResponse = await axios.get(
      `${API_BASE_URL}/api/creatives`
    );
    console.log(
      "✅ GET /api/creatives successful:",
      allCreativesResponse.data.length,
      "creatives found"
    );

    // Test 2: Get creatives by portfolio
    console.log("\n2️⃣ Testing GET /api/creatives/portfolios/{portfolio_id}");
    const portfolioCreativesResponse = await axios.get(
      `${API_BASE_URL}/api/creatives/portfolios/${testData.portfolio_id}`
    );
    console.log(
      "✅ GET /api/creatives/portfolios/{portfolio_id} successful:",
      portfolioCreativesResponse.data.length,
      "creatives found"
    );

    // Test 3: Create creative in portfolio
    console.log("\n3️⃣ Testing POST /api/creatives/portfolios/{portfolio_id}");
    const formData = new FormData();
    formData.append("title", "Test Creative");
    formData.append("description", "A test creative for API testing");

    const testFilePath = createTestFile();
    formData.append("files", fs.createReadStream(testFilePath));

    const createCreativeResponse = await axios.post(
      `${API_BASE_URL}/api/creatives/portfolios/${testData.portfolio_id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    console.log("✅ POST /api/creatives/portfolios/{portfolio_id} successful");
    testData.creative_id = createCreativeResponse.data.id;
    console.log("📝 Creative ID:", testData.creative_id);

    // Test 4: Get specific creative
    console.log(
      "\n4️⃣ Testing GET /api/creatives/portfolios/{portfolio_id}/{creative_id}"
    );
    const creativeResponse = await axios.get(
      `${API_BASE_URL}/api/creatives/portfolios/${testData.portfolio_id}/${testData.creative_id}`
    );
    console.log(
      "✅ GET /api/creatives/portfolios/{portfolio_id}/{creative_id} successful"
    );
    console.log("📝 Creative title:", creativeResponse.data.title);

    // Test 5: Update creative
    console.log(
      "\n5️⃣ Testing PATCH /api/creatives/portfolios/{portfolio_id}/{creative_id}"
    );
    const updateFormData = new FormData();
    updateFormData.append("title", "Updated Test Creative");
    updateFormData.append("description", "Updated description for testing");

    const updateCreativeResponse = await axios.patch(
      `${API_BASE_URL}/api/creatives/portfolios/${testData.portfolio_id}/${testData.creative_id}`,
      updateFormData,
      {
        headers: {
          ...updateFormData.getHeaders(),
        },
      }
    );
    console.log(
      "✅ PATCH /api/creatives/portfolios/{portfolio_id}/{creative_id} successful"
    );
    console.log("📝 Updated title:", updateCreativeResponse.data.title);

    // Test 6: Delete creative
    console.log(
      "\n6️⃣ Testing DELETE /api/creatives/portfolios/{portfolio_id}/{creative_id}"
    );
    await axios.delete(
      `${API_BASE_URL}/api/creatives/portfolios/${testData.portfolio_id}/${testData.creative_id}`
    );
    console.log(
      "✅ DELETE /api/creatives/portfolios/{portfolio_id}/{creative_id} successful"
    );
  } catch (error) {
    console.error(
      "❌ Creative API test failed:",
      error.response?.data || error.message
    );
  }
};

// Cleanup function
const cleanup = async () => {
  console.log("\n🧹 Cleaning up test data...");

  try {
    // Delete portfolio (this will cascade delete associated creatives)
    if (testData.portfolio_id) {
      await axios.delete(
        `${API_BASE_URL}/api/portfolios/users/${testData.user_id}/${testData.portfolio_id}`
      );
      console.log("✅ Portfolio deleted successfully");
    }

    // Clean up test file
    const testFilePath = path.join(__dirname, "test-image.png");
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log("✅ Test file cleaned up");
    }
  } catch (error) {
    console.error(
      "⚠️  Cleanup warning:",
      error.response?.data || error.message
    );
  }
};

// Main test runner
const runTests = async () => {
  console.log("🚀 Starting Portfolio & Creative API Tests");
  console.log("=".repeat(50));

  try {
    await testPortfolioAPIs();
    await testCreativeAPIs();

    console.log("\n" + "=".repeat(50));
    console.log("🎉 All tests completed!");
  } catch (error) {
    console.error("💥 Test execution failed:", error.message);
  } finally {
    await cleanup();
    console.log("\n🏁 Test session ended");
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testData };
