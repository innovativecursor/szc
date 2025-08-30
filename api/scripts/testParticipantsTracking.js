const { Brief, User, Submission, Brand } = require("../models");

const testParticipantsTracking = async () => {
  try {
    console.log("=== TESTING PARTICIPANTS TRACKING ===\n");

    // Create test brand
    const brand = await Brand.create({
      name: "Test Brand for Participants",
      description: "Test brand to test participants tracking",
      logoUrl: "https://example.com/logo.png",
      website: "https://example.com",
      industry: "Technology",
      isActive: true,
    });
    console.log("✅ Test brand created:", brand.id);

    // Create test brief
    const brief = await Brief.create({
      brandId: brand.id,
      title: "Test Brief for Participants",
      description: "Test brief to test participants tracking",
      isPaid: true,
      prizeAmount: 1000,
      submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      votingStart: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      votingEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: "submission",
      crmUserId: "test-crm-user",
      isActive: true,
      participants: [],
    });
    console.log("✅ Test brief created:", brief.id);
    console.log("Initial participants:", brief.participants);

    // Create test users
    const user1 = await User.create({
      username: "testuser1",
      email: "testuser1@test.com",
      password: "TestUser@2024",
      firstName: "Test",
      lastName: "User1",
      displayName: "Test User 1",
      roles: "user",
      isVerified: true,
      isActive: true,
    });
    console.log("✅ Test user 1 created:", user1.id);

    const user2 = await User.create({
      username: "testuser2",
      email: "testuser2@test.com",
      password: "TestUser@2024",
      firstName: "Test",
      lastName: "User2",
      displayName: "Test User 2",
      roles: "user",
      isVerified: true,
      isActive: true,
    });
    console.log("✅ Test user 2 created:", user2.id);

    // Create submissions (this should trigger the hooks)
    console.log("\n--- Creating submissions ---");

    const submission1 = await Submission.create({
      briefId: brief.id,
      userId: user1.id,
      description: "Test submission 1",
      files: [
        {
          id: "test-file-1",
          filename: "test1.jpg",
          size: 1024,
          type: "image/jpeg",
          url: "https://example.com/test1.jpg",
          hash: "test-hash-1",
        },
      ],
      title: "Test Submission 1",
      concept: "Test concept 1",
      status: "submitted",
      submissionDate: new Date(),
    });
    console.log("✅ Submission 1 created for user 1");

    // Refresh brief to see updated participants
    await brief.reload();
    console.log("Participants after user 1 submission:", brief.participants);

    const submission2 = await Submission.create({
      briefId: brief.id,
      userId: user2.id,
      description: "Test submission 2",
      files: [
        {
          id: "test-file-2",
          filename: "test2.jpg",
          size: 2048,
          type: "image/jpeg",
          url: "https://example.com/test2.jpg",
          hash: "test-hash-2",
        },
      ],
      title: "Test Submission 2",
      concept: "Test concept 2",
      status: "submitted",
      submissionDate: new Date(),
    });
    console.log("✅ Submission 2 created for user 2");

    // Refresh brief to see updated participants
    await brief.reload();
    console.log("Participants after user 2 submission:", brief.participants);

    // Test updating a submission
    console.log("\n--- Updating submission ---");
    await submission1.update({
      description: "Updated test submission 1",
    });
    console.log("✅ Submission 1 updated");

    // Refresh brief to see participants (should remain the same)
    await brief.reload();
    console.log("Participants after submission update:", brief.participants);

    // Test deleting a submission
    console.log("\n--- Deleting submission ---");
    await submission1.destroy();
    console.log("✅ Submission 1 deleted");

    // Refresh brief to see updated participants
    await brief.reload();
    console.log("Participants after submission deletion:", brief.participants);

    console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
    console.log(
      "Final participants array:",
      JSON.stringify(brief.participants, null, 2)
    );

    // Cleanup
    await submission2.destroy();
    await brief.destroy();
    await user1.destroy();
    await user2.destroy();
    await brand.destroy();
    console.log("✅ Test data cleaned up");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Stack:", error.stack);
  }
};

// Run if called directly
if (require.main === module) {
  testParticipantsTracking()
    .then(() => {
      console.log("\n=== TEST COMPLETED ===");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

module.exports = { testParticipantsTracking };
