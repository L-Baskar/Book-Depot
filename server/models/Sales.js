import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
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

const salesSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true },
    date: { type: Date, required: true },
    counter: Number,
    customerName: { type: String, required: true,  default: "Cash Customer"  },
    mobile: String,
    items: [itemSchema],
    total: Number,
    discount: Number,
    netAmount: Number,
    cashGiven: Number,
    balance: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Sales", salesSchema);
