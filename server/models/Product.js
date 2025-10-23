




// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // 🔹 Product identifiers
        shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    code: { type: String, required: true },      // Product code
    name: { type: String, required: true },      // Product name
    shortName: { type: String },

    // 🔹 Category
    category: { type: String },

    // 🔹 Batch info (1 document = 1 batch)
    batchNo: { type: String, required: true },   // Unique per product
    qty: { type: Number, default: 0 },
    minQty: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },

    // 🔹 Tax info
    taxPercent: { type: Number, default: 0 },
    taxMode: {
      type: String,
      enum: ["inclusive", "exclusive"],
      default: "exclusive",
    },
  },
  {
    timestamps: true, // ✅ Auto adds createdAt & updatedAt
  }
);

// ✅ Composite unique index to prevent duplicate product+batch
productSchema.index({ shop: 1, code: 1, batchNo: 1 }, { unique: true });
module.exports = {
  schema: productSchema,                           // 🔹 export schema
  model: mongoose.models.Product || mongoose.model("Product", productSchema) // 🔹 export model
};