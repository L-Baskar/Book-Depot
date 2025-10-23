// function generateTenantUri(shopname) {
//   const base = process.env.TENANT_DB_URI; 
//   // e.g. mongodb+srv://user:pass@cluster0.jyjvtg7.mongodb.net
//   return `${base}/${shopname}_db`;  // tenant DB name pattern
// }

// module.exports = { generateTenantUri };


// config/tenantUtils.js

// // Generate a unique MongoDB URI per shop
// const generateTenantUri = (shopname) => {
//   const baseUri = process.env.TENANT_DB_URI; 
//   if (!baseUri) throw new Error("TENANT_DB_URI is not defined in .env");
//   return `${baseUri}/${shopname}_db`; // e.g., salesdb_shop1
// };

// module.exports = { generateTenantUri };


// config/tenantUtils.js
const generateTenantUri = (shopname) => {
  const baseUri = process.env.TENANT_DB_URI;
  if (!baseUri) throw new Error("TENANT_DB_URI is not defined in .env");

  // Sanitize the shopname: replace spaces and invalid chars with underscores
  const sanitizedName = shopname.replace(/[^a-zA-Z0-9_-]/g, "_");

  return `${baseUri}/${sanitizedName}_db`; // e.g., salesdb_Car_Show_Room_db
};

module.exports = { generateTenantUri };
