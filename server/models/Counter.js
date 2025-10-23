// const mongoose = require("mongoose");

// const counterSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   seq: { type: Number, default: 0 },
// });

// // Prevent OverwriteModelError when hot-reloading with nodemon
// module.exports = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

//model/Counter.js
// const mongoose = require("mongoose");

// const counterSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   seq: { type: Number, default: 0 },
// });

// // Export both schema & model
// module.exports = {
//   schema: counterSchema,
//   model: mongoose.models.Counter || mongoose.model("Counter", counterSchema),
// };


//model/Counter.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Avoid OverwriteModelError in dev/hot-reload
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

module.exports = { schema: counterSchema, model: Counter };
