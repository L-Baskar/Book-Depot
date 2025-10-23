// const mongoose = require("mongoose");

// const shopSchema = new mongoose.Schema({
//   shopname: { type: String, required: true, unique: true },
//   tenantDbUri: { type: String, required: true },
// }, { timestamps: true });

// module.exports = mongoose.model("Shop", shopSchema);



// // server/models/Shop.js
// const mongoose = require("mongoose");

// const shopSchema = new mongoose.Schema({
//   shopname: { type: String, required: true, unique: true },
//   designation: { type: String, default: "" },
//   address: { type: String, default: "" },
//   contact: { type: String, default: "" },
//   tenantDbUri: { type: String, default: "" }, // optional explicit full URI
//   status: { type: String, enum: ["active", "inactive"], default: "active" },
// }, { timestamps: true });

// module.exports = mongoose.model("Shop", shopSchema);


// models/Shop.js
const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopname: { type: String, required: true, unique: true },
    designation: { type: String },
    address: { type: String },
    contact: { type: String },
    tenantDbUri: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);




module.exports =
  mongoose.models.Shop || mongoose.model("Shop", shopSchema);