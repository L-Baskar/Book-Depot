// server/models/Category.js
const mongoose = require("mongoose");

// const CategorySchema = new mongoose.Schema(
//   {
//     categories: [
//       {
//          shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
//         type: String, // simple string list of categories
//         required: true,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // ✅ Export schema + model (for tenant usage)
// module.exports = {
//   schema: CategorySchema,
//   model:
//     mongoose.models.Category ||
//     mongoose.model("Category", CategorySchema),
// };



const CategorySchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true }, // shop reference at document level
    categories: [
      {
        type: String, // the category name
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = {
  schema: CategorySchema,
  model: mongoose.models.Category || mongoose.model("Category", CategorySchema),
};
