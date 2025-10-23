// utils/getNextOrderNo.js
// // utils/getNextOrderNo.js
// const Counter = require("../models/Counter").model;

// /**
//  * Generate next order number for a specific shop
//  * @param {string} shopname - tenant/shop identifier
//  * @returns {string} formatted order number, e.g. "Order001"
//  */
// async function getNextOrderNo(shopname) {
//   if (!shopname) throw new Error("Shopname is required for multi-tenant order numbers");

//   const counterName = `order_${shopname}`; // unique counter per shop

//   const counter = await Counter.findOneAndUpdate(
//     { name: counterName },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true } // create if not exists
//   );

//   return "Order" + counter.seq.toString().padStart(3, "0");
// }

// module.exports = getNextOrderNo;

// utils/getNextOrderNo.js
// utils/getNextOrderNo.js

const Counter = require("../models/Counter").model;

/**
 * Generate or preview next order number for a shop
 * @param {string} shopname - Unique identifier of the shop
 * @param {boolean} increment - true = increment counter, false = preview only
 * @returns {string} e.g., ORDER001
 */
async function getNextOrderNo(shopname, increment = true) {
  if (!shopname) throw new Error("Shopname is required");

  const counterName = `order_${shopname}`;

  if (increment) {
    // ✅ Atomic increment using findOneAndUpdate
    const counter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return "ORDER" + counter.seq.toString().padStart(3, "0");
  } else {
    // Preview next number without incrementing
    let counter = await Counter.findOne({ name: counterName });
    const nextSeq = counter ? counter.seq + 1 : 1;
    return "ORDER" + nextSeq.toString().padStart(3, "0");
  }
}

module.exports = getNextOrderNo;
