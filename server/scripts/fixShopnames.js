
// // scripts/fixShopnames.js
// const mongoose = require("mongoose");
// const Shop = require("../models/Shop"); // Adjust path if needed
// require("dotenv").config(); // if using env for DB URI

// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourDbName";

// function toTitleCase(str) {
//   return str
//     .toLowerCase()
//     .trim()
//     .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
// }

// async function normalizeShopnames() {
//   try {
//     await mongoose.connect(MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     const shops = await Shop.find();
//     for (const shop of shops) {
//       const normalized = toTitleCase(shop.shopname);
//       if (shop.shopname !== normalized) {
//         console.log(`Updating "${shop.shopname}" → "${normalized}"`);
//         shop.shopname = normalized;
//         await shop.save();
//       }
//     }

//     console.log("All shopnames normalized!");
//     process.exit(0);
//   } catch (err) {
//     console.error("Error normalizing shopnames:", err);
//     process.exit(1);
//   }
// }

// normalizeShopnames();
