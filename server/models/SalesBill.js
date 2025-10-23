
//models/SalesBill.js
const mongoose = require("mongoose");

const salesItemSchema = mongoose.Schema({
  code: String,
  name: String,
  batch: String,
  mrp: Number,
  rate: Number,
  qty: Number,
  gst: Number,
  amount: Number,
  value: Number,
});

const salesBillSchema = mongoose.Schema(
  {
     shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    billNo: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    customerName: { type: String, required: true,  default: "Cash Customer"  },
    mobile: { type: String },
    counter: { type: Number, default: 1 },
    items: [salesItemSchema],
    total: Number,
    discount: Number,
    netAmount: Number,
    cashGiven: Number,
    balance: Number,
  },
  { timestamps: true }
);

module.exports = {
  schema: salesBillSchema,                         // ✅ for tenantModels.js
  model: mongoose.model("SalesBill", salesBillSchema) // ✅ optional global use
};



