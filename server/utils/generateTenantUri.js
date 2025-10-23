function generateTenantUri(shopname) {
  const base = process.env.TENANT_DB_URI; 
  // e.g. mongodb+srv://user:pass@cluster0.jyjvtg7.mongodb.net
  return `${base}/${shopname}_db`;  // tenant DB name pattern
}

module.exports = { generateTenantUri };
