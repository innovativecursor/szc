const axios = require("axios");

const BASE_URL = "http://localhost:8080/api";

async function testTrialRun() {
  try {
    console.log("🧪 Testing SkillzCollab API Trial Run...\n");

    // Test 1: Health Check
    console.log("1. Testing Health Check...");
    const healthResponse = await axios.get("http://localhost:8080/health");
    console.log("✅ Health Check:", healthResponse.data);
    console.log("");

    // Test 2: Create a Brand
    console.log("2. Creating a Brand...");
    const brandData = {
      name: "Test Brand Inc",
      contact_email: "test@brandinc.com",
      registered_office: "123 Test Street, Test City",
      address: "456 Business Ave, Test City, TC 12345",
      business_field: "Technology",
      logo_url: "https://example.com/logo.png",
      website_url: "https://brandinc.com",
    };

    const brandResponse = await axios.post(`${BASE_URL}/brands`, brandData);
    console.log("✅ Brand Created:", brandResponse.data);
    const brandId = brandResponse.data.id;
    console.log("");

    // Test 3: Get All Brands
    console.log("3. Getting All Brands...");
    const brandsResponse = await axios.get(`${BASE_URL}/brands`);
    console.log(
      "✅ Brands Retrieved:",
      brandsResponse.data.length,
      "brands found"
    );
    console.log("");

    // Test 4: Get Brand by ID
    console.log("4. Getting Brand by ID...");
    const brandByIdResponse = await axios.get(`${BASE_URL}/brands/${brandId}`);
    console.log("✅ Brand Retrieved:", brandByIdResponse.data);
    console.log("");

    // Test 5: Create a Brief
    console.log("5. Creating a Brief...");
    const briefData = {
      title: "Design a New Logo",
      description: "We need a modern, professional logo for our tech startup",
      is_paid: true,
      prize_amount: 500.0,
      submission_deadline: "2024-12-31T23:59:59Z",
      status: "submission",
      brand_id: brandId,
    };

    const briefResponse = await axios.post(`${BASE_URL}/briefs`, briefData);
    console.log("✅ Brief Created:", briefResponse.data);
    const briefId = briefResponse.data.id;
    console.log("");

    // Test 6: Get All Briefs
    console.log("6. Getting All Briefs...");
    const briefsResponse = await axios.get(`${BASE_URL}/briefs`);
    console.log(
      "✅ Briefs Retrieved:",
      briefsResponse.data.length,
      "briefs found"
    );
    console.log("");

    // Test 7: Get Brief by ID
    console.log("7. Getting Brief by ID...");
    const briefByIdResponse = await axios.get(`${BASE_URL}/briefs/${briefId}`);
    console.log("✅ Brief Retrieved:", briefByIdResponse.data);
    console.log("");

    console.log("🎉 All tests passed! Trial run successful!");
    console.log("");
    console.log("📋 Summary:");
    console.log(`   - Brand created with ID: ${brandId}`);
    console.log(`   - Brief created with ID: ${briefId}`);
    console.log(`   - API endpoints working correctly`);
    console.log("");
    console.log("🚀 You can now use Postman to test the API!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testTrialRun();
