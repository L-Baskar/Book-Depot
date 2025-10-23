// config/db.js
const mongoose = require("mongoose");

async function connectMasterDB() {
  try {
    await mongoose.connect(process.env.MASTER_DB_URI);
    console.log("✅ Master DB connected");
  } catch (err) {
    console.error("❌ Master DB Connection Error:", err);
    process.exit(1); // stop server if master DB fails
  }
}

module.exports = { connectMasterDB };
