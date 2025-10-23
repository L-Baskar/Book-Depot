// // controllers/salesBillController.js
// const mongoose = require("mongoose");

// const getNextBillNoUtil = async (SalesBill) => {
//   const lastBill = await SalesBill.findOne().sort({ createdAt: -1 }); // get latest by creation date
//   let nextBillNo = "B001";

//   if (lastBill && lastBill.billNo) {
//     // remove 'B' prefix and parse number
//     const lastNum = parseInt(lastBill.billNo.replace(/^B/, ""), 10);
//     nextBillNo = "B" + (lastNum + 1).toString().padStart(3, "0");
//   }

//   return nextBillNo;
// };


// // -----------------------------
// // GET all sales bills for tenant shop
// // -----------------------------

// exports.getSalesBills = async (req, res) => {
//   try {
//     if (!req.shop || !req.shop._id) {
//       return res.status(400).json({ message: "Shop context missing" });
//     }

//     const { SalesBill } = req.tenantModels;
//     const bills = await SalesBill.find({ shop: req.shop._id }).sort({ createdAt: -1 });
//     res.json(bills);
//   } catch (error) {
//     console.error("getSalesBills error:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };


// // -----------------------------
// // GET sales bill by ID
// // -----------------------------
// // exports.getSalesBillById = async (req, res) => {
// //   try {
// //     const { SalesBill } = req.tenantModels;

// //     const bill = await SalesBill.findOne({ _id: req.params.id, shop: req.shop._id });
// //     if (!bill) return res.status(404).json({ message: "Bill not found" });

// //     res.json(bill);
// //   } catch (error) {
// //     console.error("getSalesBillById error:", error);
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };



// exports.getSalesBillById = async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const { id } = req.params;

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid bill ID" });
//     }

//     const bill = await SalesBill.findOne({ _id: id, shop: req.shop._id });
//     if (!bill) return res.status(404).json({ message: "Bill not found" });

//     res.json(bill);
//   } catch (error) {
//     console.error("getSalesBillById error:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };


// // -----------------------------
// // CREATE a sales bill
// // -----------------------------
// exports.createSalesBill = async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;

//     const nextBillNo = await getNextBillNoUtil(SalesBill);

//     const newBill = new SalesBill({
//       shop: req.shop._id,            // ✅ Important!
//       ...req.body,
//       billNo: nextBillNo,
//     });

//     const savedBill = await newBill.save();
//     res.status(201).json(savedBill);
//   } catch (error) {
//     console.error("createSalesBill error:", error);
//     res.status(400).json({ message: "Error saving bill", error: error.message });
//   }
// };

// // -----------------------------
// // UPDATE a sales bill
// // -----------------------------
// exports.updateSalesBill = async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;

//     const updatedBill = await SalesBill.findOneAndUpdate(
//       { _id: req.params.id, shop: req.shop._id },
//       req.body,
//       { new: true }
//     );

//     if (!updatedBill) return res.status(404).json({ message: "Bill not found" });
//     res.json(updatedBill);
//   } catch (error) {
//     console.error("updateSalesBill error:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// // -----------------------------
// // DELETE a sales bill
// // -----------------------------
// exports.deleteSalesBill = async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;

//     const deletedBill = await SalesBill.findOneAndDelete({
//       _id: req.params.id,
//       shop: req.shop._id,
//     });

//     if (!deletedBill) return res.status(404).json({ message: "Bill not found" });
//     res.json({ message: "Bill deleted successfully" });
//   } catch (error) {
//     console.error("deleteSalesBill error:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// // -----------------------------
// // GET next bill number
// // -----------------------------
// exports.getNextBillNo = async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const nextBillNo = await getNextBillNoUtil(SalesBill);
//     res.json({ billNo: nextBillNo });
//   } catch (err) {
//     console.error("getNextBillNo error:", err);
//     res.status(400).json({ message: "Failed to get next bill number" });
//   }
// };



// // UPDATE a sales bill with proper stock adjustment
// exports.updateSalesBill = async (req, res) => {
//   try {
//     const { SalesBill, Product } = req.tenantModels; // include Product for stock
//     const billId = req.params.id;

//     const bill = await SalesBill.findOne({ _id: billId, shop: req.shop._id });
//     if (!bill) return res.status(404).json({ message: "Bill not found" });

//     const newItems = req.body.items || [];

//     // Adjust stock based on difference between old and new quantities
//     for (const newItem of newItems) {
//       const oldItem = bill.items.find(i => i.code === newItem.code && i.batch === newItem.batch);
//       const oldQty = oldItem?.qty || 0;
//       const deltaQty = newItem.qty - oldQty;

//       if (deltaQty > 0) {
//         // Quantity increased → decrement stock
//         await Product.findOneAndUpdate(
//           { code: newItem.code, batch: newItem.batch },
//           { $inc: { stock: -deltaQty } }
//         );
//       } else if (deltaQty < 0) {
//         // Quantity decreased → increment stock
//         await Product.findOneAndUpdate(
//           { code: newItem.code, batch: newItem.batch },
//           { $inc: { stock: -deltaQty * -1 } } // +(-deltaQty)
//         );
//       }
//     }

//     // Update bill fields
//     bill.customerName = req.body.customerName || bill.customerName;
//     bill.mobile = req.body.mobile || bill.mobile;
//     bill.counter = req.body.counter || bill.counter;
//     bill.items = newItems;
//     bill.total = req.body.total || bill.total;
//     bill.discount = req.body.discount || bill.discount;
//     bill.netAmount = req.body.netAmount || bill.netAmount;
//     bill.cgst = req.body.cgst || bill.cgst;
//     bill.sgst = req.body.sgst || bill.sgst;
//     bill.cashGiven = req.body.cashGiven || bill.cashGiven;
//     bill.balance = req.body.balance || bill.balance;

//     const updatedBill = await bill.save();
//     res.json(updatedBill);
//   } catch (error) {
//     console.error("updateSalesBill error:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };




// controllers/salesBillController.js
const mongoose = require("mongoose");

// Utility to get the next bill number
const getNextBillNoUtil = async (SalesBill) => {
  const lastBill = await SalesBill.findOne().sort({ createdAt: -1 });
  let nextBillNo = "B001";

  if (lastBill && lastBill.billNo) {
    const lastNum = parseInt(lastBill.billNo.replace(/^B/, ""), 10);
    nextBillNo = "B" + (lastNum + 1).toString().padStart(3, "0");
  }

  return nextBillNo;
};

// controllers/salesBillController.js
// exports.getSalesBills = async (req, res) => {
//   try {
//     if (!req.shop || !req.shop._id) {
//       return res.status(400).json({ message: "Shop context missing" });
//     }

//     const { page = 1, limit = 10, search = "", filter = "", fromDate, toDate } = req.query;
//     const skip = (Number(page) - 1) * Number(limit);
//     const { SalesBill } = req.tenantModels;

//     const query = { shop: req.shop._id };

//     // ---------- Search ----------
//     if (search.trim()) {
//       const regex = new RegExp(search.trim(), "i"); // case-insensitive
//       query.$or = [
//         { billNo: regex },
//         { customerName: regex },
//         { mobile: regex },
//       ];
//     }

//     // ---------- Date Filter ----------
//     const now = new Date();
//     if (filter) {
//       switch (filter) {
//         case "today":
//           query.date = {
//             $gte: new Date(now.setHours(0, 0, 0, 0)),
//             $lte: new Date(now.setHours(23, 59, 59, 999)),
//           };
//           break;
//         case "this-week":
//           const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
//           firstDay.setHours(0, 0, 0, 0);
//           const lastDay = new Date(firstDay);
//           lastDay.setDate(firstDay.getDate() + 6);
//           lastDay.setHours(23, 59, 59, 999);
//           query.date = { $gte: firstDay, $lte: lastDay };
//           break;
//         case "this-month":
//           const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//           const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//           query.date = { $gte: firstDayMonth, $lte: lastDayMonth };
//           break;
//         case "custom":
//           if (fromDate && toDate) {
//             query.date = { $gte: new Date(fromDate), $lte: new Date(toDate + "T23:59:59.999Z") };
//           }
//           break;
//       }
//     }

//     const totalBills = await SalesBill.countDocuments(query);
//     const bills = await SalesBill.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     res.json({
//       bills,
//       totalPages: Math.ceil(totalBills / Number(limit)),
//       totalBills,
//       page: Number(page),
//       limit: Number(limit),
//     });
//   } catch (error) {
//     console.error("getSalesBills error:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// ==========================
// ✅ Fetch All Sales Bills
// ==========================
exports.getSalesBills = async (req, res) => {
  try {
    if (!req.shop || !req.shop._id) {
      return res.status(400).json({ message: "Shop context missing" });
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      filter = "",
      fromDate,
      toDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const { SalesBill } = req.tenantModels;

    const query = { shop: req.shop._id };

    // ---------- 🔍 Search ----------
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { billNo: regex },
        { customerName: regex },
        { mobile: regex },
      ];
    }

    // ---------- 📅 Date Filters ----------
    const now = new Date();

    if (filter) {
      switch (filter) {
        case "today":
          query.date = {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lte: new Date(now.setHours(23, 59, 59, 999)),
          };
          break;

        case "this-week": {
          const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
          firstDay.setHours(0, 0, 0, 0);
          const lastDay = new Date(firstDay);
          lastDay.setDate(firstDay.getDate() + 6);
          lastDay.setHours(23, 59, 59, 999);
          query.date = { $gte: firstDay, $lte: lastDay };
          break;
        }

        case "this-month": {
          const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDayMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          query.date = { $gte: firstDayMonth, $lte: lastDayMonth };
          break;
        }

        case "custom":
          if (fromDate && toDate) {
            query.date = {
              $gte: new Date(fromDate),
              $lte: new Date(toDate + "T23:59:59.999Z"),
            };
          }
          break;
      }
    }

    // ---------- 📊 Fetch Data ----------
    const totalBills = await SalesBill.countDocuments(query);
    const bills = await SalesBill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      bills,
      totalPages: Math.ceil(totalBills / Number(limit)),
      totalBills,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("❌ getSalesBills error:", error);
    res.status(500).json({
      message: "Server Error while fetching sales bills",
      error: error.message,
    });
  }
};

// -----------------------------
// GET sales bill by ID
// -----------------------------


exports.getSalesBillById = async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const idOrNext = req.params.id;

    // Handle dynamic "next-bill-no"
    if (idOrNext === "next-bill-no") {
      const nextBillNo = await getNextBillNoUtil(SalesBill, req.shop._id);
      return res.json({ billNo: nextBillNo });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(idOrNext)) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }

    const bill = await SalesBill.findOne({
      _id: idOrNext,
      shop: req.shop._id,
    });

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    res.json(bill);
  } catch (error) {
    console.error("getSalesBillById error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// -----------------------------
// CREATE a sales bill
// -----------------------------
// exports.createSalesBill = async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;

//     const nextBillNo = await getNextBillNoUtil(SalesBill);

//     const newBill = new SalesBill({
//       shop: req.shop._id,
//       ...req.body,
//       billNo: nextBillNo,
//     });

//     const savedBill = await newBill.save();
//     res.status(201).json(savedBill);
//   } catch (error) {
//     console.error("createSalesBill error:", error);
//     res.status(400).json({ message: "Error saving bill", error: error.message });
//   }
// };


exports.createSalesBill = async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const nextBillNo = await getNextBillNoUtil(SalesBill);

    const newBill = new SalesBill({
      shop: req.shop._id,
      ...req.body,
      billNo: nextBillNo,
    });

    const savedBill = await newBill.save();

    // Emit to all clients
    if (req.io) {
      const billWithShop = {
        ...savedBill.toObject(),
        shop: { _id: req.shop._id, shopname: req.shop.shopname },
      };
      req.io.emit("new-bill", billWithShop);
    }

    res.status(201).json(savedBill);
  } catch (error) {
    console.error("createSalesBill error:", error);
    res.status(400).json({ message: "Error saving bill", error: error.message });
  }
};


// -----------------------------
// UPDATE a sales bill with stock adjustment
// -----------------------------
// exports.updateSalesBill = async (req, res) => {
//   try {
//     const { SalesBill, Product } = req.tenantModels;
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid bill ID" });
//     }

//     const bill = await SalesBill.findOne({ _id: id, shop: req.shop._id });
//     if (!bill) return res.status(404).json({ message: "Bill not found" });

//     const newItems = req.body.items || [];

//     // Adjust stock based on difference between old and new quantities
//     for (const newItem of newItems) {
//       const oldItem = bill.items.find(i => i.code === newItem.code && i.batch === newItem.batch);
//       const oldQty = oldItem?.qty || 0;
//       const deltaQty = newItem.qty - oldQty;

//       if (deltaQty !== 0) {
//         await Product.findOneAndUpdate(
//           { code: newItem.code, batch: newItem.batch },
//           { $inc: { stock: -deltaQty } }
//         );
//       }
//     }

//     // Update bill fields
//     bill.customerName = req.body.customerName || bill.customerName;
//     bill.mobile = req.body.mobile || bill.mobile;
//     bill.counter = req.body.counter || bill.counter;
//     bill.items = newItems;
//     bill.total = req.body.total || bill.total;
//     bill.discount = req.body.discount || bill.discount;
//     bill.netAmount = req.body.netAmount || bill.netAmount;
//     bill.cgst = req.body.cgst || bill.cgst;
//     bill.sgst = req.body.sgst || bill.sgst;
//     bill.cashGiven = req.body.cashGiven || bill.cashGiven;
//     bill.balance = req.body.balance || bill.balance;

//     const updatedBill = await bill.save();
//     res.json(updatedBill);
//   } catch (error) {
//     console.error("updateSalesBill error:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

exports.updateSalesBill = async (req, res) => {
  try {
    const { SalesBill, Product } = req.tenantModels;
    const { id } = req.params;

    // 1️⃣ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }

    // 2️⃣ Find existing bill
    const bill = await SalesBill.findOne({ _id: id, shop: req.shop._id });
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const oldItems = bill.items || [];
    const newItems = req.body.items || [];

    // Convert to Map for faster lookup
    const oldMap = new Map(oldItems.map(i => [`${i.code}_${i.batch}`, i]));
    const newMap = new Map(newItems.map(i => [`${i.code}_${i.batch}`, i]));

    // 3️⃣ Handle updated / existing items
    for (const newItem of newItems) {
      const key = `${newItem.code}_${newItem.batch}`;
      const oldItem = oldMap.get(key);

      const oldQty = oldItem ? Number(oldItem.qty) : 0;
      const newQty = Number(newItem.qty);
      const delta = newQty - oldQty;

      if (delta !== 0) {
        // +delta → increased qty → stock decreases
        // -delta → decreased qty → stock increases
        await Product.findOneAndUpdate(
          { code: newItem.code, batch: newItem.batch },
          { $inc: { stock: -delta } }, // delta sign logic handled automatically
          { new: true }
        );
      }
    }

    // 4️⃣ Handle removed items (restore stock)
    for (const oldItem of oldItems) {
      const key = `${oldItem.code}_${oldItem.batch}`;
      if (!newMap.has(key)) {
        // item removed from bill → add stock back
        await Product.findOneAndUpdate(
          { code: oldItem.code, batch: oldItem.batch },
          { $inc: { stock: oldItem.qty } }
        );
      }
    }

    // 5️⃣ Update bill fields
    bill.customerName = req.body.customerName || bill.customerName;
    bill.mobile = req.body.mobile || bill.mobile;
    bill.counter = req.body.counter || bill.counter;
    bill.items = newItems;
    bill.total = req.body.total || bill.total;
    bill.discount = req.body.discount || bill.discount;
    bill.netAmount = req.body.netAmount || bill.netAmount;
    bill.cgst = req.body.cgst || bill.cgst;
    bill.sgst = req.body.sgst || bill.sgst;
    bill.cashGiven = req.body.cashGiven || bill.cashGiven;
    bill.balance = req.body.balance || bill.balance;

    // 6️⃣ Save updated bill
    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (error) {
    console.error("updateSalesBill error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// -----------------------------
// DELETE a sales bill
// -----------------------------
exports.deleteSalesBill = async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }

    const deletedBill = await SalesBill.findOneAndDelete({ _id: id, shop: req.shop._id });
    if (!deletedBill) return res.status(404).json({ message: "Bill not found" });

    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("deleteSalesBill error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// -----------------------------
// GET next bill number
// -----------------------------
exports.getNextBillNo = async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const nextBillNo = await getNextBillNoUtil(SalesBill);
    res.json({ billNo: nextBillNo });
  } catch (error) {
    console.error("getNextBillNo error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
