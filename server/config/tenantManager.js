

// // config/tenantManager.js
// const mongoose = require("mongoose");
// const { generateTenantUri } = require("./tenantUtils");

// const connections = {};

// /**
//  * Get or create a tenant database connection
//  * @param {string} shopname - The shop name (used in DB naming)
//  */
// async function getTenantDB(shopname) {
//   if (connections[shopname]) return connections[shopname];

//   const tenantDbUri = generateTenantUri(shopname);
//   if (!tenantDbUri) throw new Error("Tenant DB URI could not be generated");

//   try {
//     console.log(`🔹 Connecting to tenant DB for ${shopname}...`);
    
//     // Removed deprecated options
//     const conn = await mongoose.createConnection(tenantDbUri).asPromise();

//     connections[shopname] = conn;
//     console.log(`✅ Tenant DB connected for ${shopname}`);
//     return conn;
//   } catch (err) {
//     console.error(`❌ Failed to connect tenant DB for ${shopname}:`, err.message);
//     throw err;
//   }
// }

// module.exports = { getTenantDB };

// config/tenantManager.js
const mongoose = require("mongoose");
const { generateTenantUri } = require("./tenantUtils");

const connections = {};

/**
 * Get or create a tenant database connection
 * @param {string} shopname - The shop name (used in DB naming)
 */
async function getTenantDB(shopname) {
  const decodedShopname = decodeURIComponent(shopname.trim()); // ✅ decode URL
  if (connections[decodedShopname]) return connections[decodedShopname];

  const tenantDbUri = generateTenantUri(decodedShopname);
  if (!tenantDbUri) throw new Error(`Tenant DB URI could not be generated for ${decodedShopname}`);

  try {
    console.log(`🔹 Connecting to tenant DB for ${decodedShopname}...`);
    
    const conn = await mongoose.createConnection(tenantDbUri).asPromise();
    connections[decodedShopname] = conn;
    console.log(`✅ Tenant DB connected for ${decodedShopname}`);
    return conn;
  } catch (err) {
    console.error(`❌ Failed to connect tenant DB for ${decodedShopname}:`, err.message);
    throw err;
  }
}

module.exports = { getTenantDB };
