const axios = require("axios");

const BASE_URL = "http://localhost:8080/api";

async function testBrandFiltering() {
  try {
    console.log("🧪 Testing Brand Creation and Filtering...\n");

    // Test 1: Create a brand
    console.log("1️⃣ Creating a brand...");
    const brandData = {
      name: "TestBrand",
      contact_email: "test@example.com",
      registered_office: "Test Office",
      address: "Test Address",
      business_field: "Technology",
      logo_url: "https://example.com/logo.png",
      website_url: "https://example.com",
    };

    const createResponse = await axios.post(`${BASE_URL}/brands`, brandData);
    console.log("✅ Brand created successfully:", createResponse.data.id);
    const brandId = createResponse.data.id;

    // Test 2: Create another brand with different business field
    console.log("\n2️⃣ Creating another brand with different business field...");
    const brandData2 = {
      name: "DesignBrand",
      contact_email: "design@example.com",
      business_field: "Design",
      address: "Design Address",
    };

    const createResponse2 = await axios.post(`${BASE_URL}/brands`, brandData2);
    console.log(
      "✅ Second brand created successfully:",
      createResponse2.data.id
    );

    // Test 3: Get all brands
    console.log("\n3️⃣ Getting all brands...");
    const getAllResponse = await axios.get(`${BASE_URL}/brands`);
    console.log(`✅ Found ${getAllResponse.data.length} brands`);

    // Test 4: Filter by business field
    console.log('\n4️⃣ Filtering by business field "Technology"...');
    const filterByFieldResponse = await axios.get(
      `${BASE_URL}/brands?business_field=Technology`
    );
    console.log(
      `✅ Found ${filterByFieldResponse.data.length} brands with Technology business field`
    );

    // Test 5: Filter by brand ID
    console.log("\n5️⃣ Filtering by brand ID...");
    const filterByIdResponse = await axios.get(
      `${BASE_URL}/brands?brand_id=${brandId}`
    );
    console.log(
      `✅ Found ${filterByIdResponse.data.length} brands with specific ID`
    );

    // Test 6: Filter by both business field and brand ID
    console.log("\n6️⃣ Filtering by both business field and brand ID...");
    const filterByBothResponse = await axios.get(
      `${BASE_URL}/brands?business_field=Technology&brand_id=${brandId}`
    );
    console.log(
      `✅ Found ${filterByBothResponse.data.length} brands with both filters`
    );

    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.log("\n🔧 500 error suggests a server-side issue. Check:");
      console.log("   - Database connection");
      console.log("   - Server logs");
      console.log("   - Model definitions");
    }
  }
}

// Run the test
testBrandFiltering();
