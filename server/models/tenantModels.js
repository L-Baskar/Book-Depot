// // models/tenantModels.js
// const modelCache = {};

// function getTenantModels(conn) {
//   if (modelCache[conn.name]) return modelCache[conn.name];

//   const models = {
//     User: conn.model("User", require("./User").schema),
//     Product: conn.model("Product", require("./Product").schema),
//     Customer: conn.model("Customer", require("./Customer").schema),
//     Order: conn.model("Order", require("./Order").schema),
//     SalesBill: conn.model("SalesBill", require("./SalesBill").schema),
//     Category: conn.model("Category", require("./Category").schema),
//     Counter: conn.model("Counter", require("./Counter").schema),
//     Shop: conn.model("Shop", require("./Shop").schema),
//   };

//   modelCache[conn.name] = models;
//   return models;
// }



// module.exports = getTenantModels;



// // server/models/tenantModels.js
// const modelCache = {};
// const mongoose = require("mongoose");

// function getTenantModels(conn) {
//   if (modelCache[conn.name]) return modelCache[conn.name];

//   const models = {
//     User: conn.model("User", require("./user").schema),
//     Product: conn.model("Product", require("./Product").schema),
//     Customer: conn.model("Customer", require("./Customer").schema),
//     Order: conn.model("Order", require("./Order").schema),
//     SalesBill: conn.model("SalesBill", require("./SalesBill").schema),
//     Category: conn.model("Category", require("./Category").schema),
//     Counter: conn.model("Counter", require("./Counter").schema),
//     // ❌ Shop removed (belongs to master DB)
//   };

//   modelCache[conn.name] = models;
//   return models;
// }

// module.exports = getTenantModels;



// server/models/tenantModels.js
const mongoose = require("mongoose");

const modelCache = {};

/**
 * Attach all tenant-specific models to a tenant connection.
 * Uses caching so models are not recompiled on each request.
 *
 * @param {mongoose.Connection} conn - tenant DB connection
 * @returns {Object} tenant models
 */
function getTenantModels(conn) {
  if (modelCache[conn.name]) {
    return modelCache[conn.name];
  }

  // Lazy-load schemas to avoid circular requires
  const User = require("./user");
  const Product = require("./Product");
  const Customer = require("./Customer");
  const Order = require("./Order");
  const SalesBill = require("./SalesBill");
  const Category = require("./Category");
  const Counter = require("./Counter");

  const models = {
    User: conn.models.User || conn.model("User", User.schema),
    Product: conn.models.Product || conn.model("Product", Product.schema),
    Customer: conn.models.Customer || conn.model("Customer", Customer.schema),
    Order: conn.models.Order || conn.model("Order", Order.schema),
    SalesBill: conn.models.SalesBill || conn.model("SalesBill", SalesBill.schema),
    Category: conn.models.Category || conn.model("Category", Category.schema),
    Counter: conn.models.Counter || conn.model("Counter", Counter.schema),
  };

  modelCache[conn.name] = models;
  return models;
}

module.exports = getTenantModels;
