// const mongoose = require("mongoose");

// const ItemSchema = new mongoose.Schema({
//   code: { type: String, required: true },
//   name: { type: String, required: true },
//   batchNo: { type: String, required: true },
//   // qty: { type: Number, required: true },
//   mrp: { type: Number, default: 0 },
// });

// const OrderSchema = new mongoose.Schema(
//   {
//     orderNo: { type: String, required: true, unique: true },
//     date: { type: String, required: true }, // "dd/mm/yyyy" from frontend
//     status: { type: String, default: "placed" }, // placed, confirmed, cancelled, etc.
//     items: [ItemSchema],

//     // Confirmation details
//     confirmedAt: { type: Date }, // actual Date object
//     confirmedDate: { type: String }, // dd/mm/yyyy string
//   },
//   { timestamps: true }
// );



// module.exports = mongoose.model("Order", OrderSchema);


//models/Orders.js

const mongoose = require("mongoose");


const ItemSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
 
  qty: { type: Number, required: true }, 

});

const OrderSchema = new mongoose.Schema(

  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    orderNo: { type: String, required: true, unique: true },
    date: { type: String, required: true }, // dd/mm/yyyy (from frontend)

    status: {
      type: String,
      enum: ["placed", "confirmed", "cancelled", "completed", "received"], // ✅ enum for control
      default: "placed",
    },

    items: [ItemSchema],

    // Confirmation details
    confirmedAt: { type: Date },       // when status set to "confirmed"
    confirmedDate: { type: String },   // formatted dd/mm/yyyy

    // Optional: Track cancellation too
    cancelledAt: { type: Date },
    cancelledDate: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  schema: OrderSchema,
  model: mongoose.models.Order || mongoose.model("Order", OrderSchema),
};