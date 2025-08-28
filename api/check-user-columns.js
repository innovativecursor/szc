const config = require("./config/database");

async function checkUserColumns() {
  try {
    await config.authenticate();
    console.log("✅ Database connection successful");

    // Check if the firstName and lastName columns exist
    const [columns] = await config.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('first_name', 'last_name')
      ORDER BY COLUMN_NAME
    `);

    console.log("\n📋 User name columns:");
    if (columns.length === 0) {
      console.log("❌ No firstName or lastName columns found!");
    } else {
      console.table(columns);
    }

    // Check all columns in the users table
    const [allColumns] = await config.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      ORDER BY COLUMN_NAME
    `);

    console.log("\n📋 All columns in users table:");
    console.table(allColumns);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    process.exit(0);
  }
}

checkUserColumns();
