


// // server/routes/reports.js
// const express = require("express");
// const mongoose = require("mongoose");
// const SalesBill = require("../models/SalesBill");
// const authTenantOrMaster = require("../middleware/authTenantOrMaster");
// const { getTenantDB } = require("../config/tenantManager");

// const router = express.Router();

// // Utility: Get tenant SalesBill model
// async function getTenantSalesBillModel(shopname) {
//   const tenantConn = await getTenantDB(shopname);
//   return tenantConn.model("SalesBill", SalesBill.schema);
// }

// // ----------------------------
// // 1️⃣ Get all bills for a shop (with pagination)
// // GET /shops/:shopname/dashboard/sales-bills?limit=100&page=1
// // ----------------------------
// router.get("/shops/:shopname/dashboard/sales-bills", authTenantOrMaster, async (req, res) => {
//   try {
//     const { shopname } = req.params;
//     const limit = parseInt(req.query.limit) || 100;
//     const page = parseInt(req.query.page) || 1;
//     const skip = (page - 1) * limit;

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);
//     const total = await SalesBillTenant.countDocuments();
//     const bills = await SalesBillTenant.find()
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.json({ bills, total, page, limit });
//   } catch (err) {
//     console.error("Failed to fetch bills:", err);
//     res.status(500).json({ error: "Failed to fetch bills" });
//   }
// });

// // ----------------------------
// // 2️⃣ Get single bill
// // GET /shops/:shopname/dashboard/sales-bills/:billId
// // ----------------------------
// router.get("/shops/:shopname/dashboard/sales-bills/:billId", authTenantOrMaster, async (req, res) => {
//   try {
//     const { shopname, billId } = req.params;
//     const SalesBillTenant = await getTenantSalesBillModel(shopname);

//     let bill;

//     if (mongoose.Types.ObjectId.isValid(billId)) {
//       bill = await SalesBillTenant.findById(billId);
//     } 

//     if (!bill) {
//       // fallback: search by billNo
//       bill = await SalesBillTenant.findOne({ billNo: billId });
//     }

//     if (!bill) return res.status(404).json({ message: "Bill not found" });

//     res.json({ bill });
//   } catch (err) {
//     console.error("Failed to fetch bill:", err);
//     res.status(500).json({ error: "Failed to fetch bill" });
//   }
// });

// // ----------------------------
// // 3️⃣ Get sales summary
// // GET /shops/:shopname/dashboard/sales-bills/summary?period=today|week|month|year&start=YYYY-MM-DD
// // ----------------------------
// // ----------------------------
// // ----------------------------
// // 3️⃣ Get sales summary
// // GET /shops/:shopname/dashboard/sales-bills/summary?period=today|week|month|year&start=YYYY-MM-DD
// // ----------------------------
// router.get("/shops/:shopname/dashboard/sales-bills/summary", authTenantOrMaster, async (req, res) => {
//   try {
//     const { shopname } = req.params;
//     const period = (req.query.period || "today").toLowerCase();
//     const startParam = req.query.start;
//     const now = new Date();

//     const getUTCMidnight = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

//     // Calculate startDate
//     let startDate = startParam ? new Date(startParam) : now;
//     if (!startParam) {
//       if (period === "today") startDate = getUTCMidnight(now);
//       if (period === "week") {
//         const day = now.getUTCDay();
//         const weekStart = new Date(now);
//         weekStart.setUTCDate(now.getUTCDate() - day);
//         startDate = getUTCMidnight(weekStart);
//       }
//       if (period === "month") startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
//       if (period === "year") startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
//     }

//     // Calculate endDate
//     let endDate;
//     if (period === "today") {
//       endDate = new Date(startDate);
//       endDate.setUTCHours(23, 59, 59, 999);
//     }
//     if (period === "week") {
//       endDate = new Date(startDate);
//       endDate.setUTCDate(startDate.getUTCDate() + 6);
//       endDate.setUTCHours(23, 59, 59, 999);
//     }
//     if (period === "month") {
//       endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
//     }
//     if (period === "year") {
//       endDate = new Date(Date.UTC(startDate.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
//     }

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);

//     const summaryAgg = await SalesBillTenant.aggregate([
//       { $match: { date: { $gte: startDate, $lte: endDate } } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: { $ifNull: ["$netAmount", 0] } },
//           totalBills: { $sum: 1 },
//           totalItems: {
//             $sum: {
//               $sum: {
//                 $map: {
//                   input: { $ifNull: ["$items", []] },
//                   as: "item",
//                   in: { $ifNull: ["$$item.qty", 0] }
//                 }
//               }
//             }
//           }
//         }
//       }
//     ]);

//     // Ensure consistent response keys for frontend
//     const summary = summaryAgg[0] || { totalAmount: 0, totalItems: 0, totalBills: 0 };

//     res.json(summary);
//   } catch (err) {
//     console.error("Failed to fetch summary:", err);
//     res.status(500).json({ error: "Failed to fetch summary" });
//   }
// });



// // ----------------------------
// // 4️⃣ Get bills in a custom date range
// // GET /shops/:shopname/dashboard/sales-bills/range?start=YYYY-MM-DD&end=YYYY-MM-DD
// // ----------------------------
// router.get("/shops/:shopname/dashboard/sales-bills/range", authTenantOrMaster, async (req, res) => {
//   try {
//     const { shopname } = req.params;
//     const { start, end } = req.query;
//     if (!start || !end) return res.status(400).json({ message: "Start and end dates required" });

//     const startDate = new Date(start);
//     const endDate = new Date(end); 
//     endDate.setHours(23,59,59,999);

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);

//     const bills = await SalesBillTenant.find({ date: { $gte: startDate, $lte: endDate } })
//       .sort({ date: -1 });

//     res.json({ bills, total: bills.length });
//   } catch (err) {
//     console.error("Failed to fetch bills by range:", err);
//     res.status(500).json({ error: "Failed to fetch bills by range" });
//   }
// });

// module.exports = router;




// // server/routes/reports.js
// const express = require("express");
// const mongoose = require("mongoose");
// const SalesBill = require("../models/SalesBill");
// const authTenantOrMaster = require("../middleware/authTenantOrMaster");
// const { getTenantDB } = require("../config/tenantManager");

// const router = express.Router();

// async function getTenantSalesBillModel(shopname) {
//   const tenantConn = await getTenantDB(shopname);
//   return tenantConn.model("SalesBill", SalesBill.schema);
// }

// // 1️⃣ All bills
// router.get("/shops/:shopname/dashboard/sales-bills", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = decodeURIComponent(req.params.shopname);
//     const limit = parseInt(req.query.limit) || 100;
//     const page = parseInt(req.query.page) || 1;
//     const skip = (page - 1) * limit;

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);
//     const total = await SalesBillTenant.countDocuments();
//     const bills = await SalesBillTenant.find().sort({ date: -1 }).skip(skip).limit(limit);

//     res.json({ bills, total, page, limit });
//   } catch (err) {
//     console.error("Failed to fetch bills:", err);
//     res.status(500).json({ error: "Failed to fetch bills" });
//   }
// });

// // 2️⃣ Single bill
// router.get("/shops/:shopname/dashboard/sales-bills/:billId", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = decodeURIComponent(req.params.shopname);
//     const { billId } = req.params;

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);

//     let bill = null;
//     if (mongoose.Types.ObjectId.isValid(billId)) {
//       bill = await SalesBillTenant.findById(billId);
//     }
//     if (!bill) {
//       bill = await SalesBillTenant.findOne({ billNo: billId });
//     }

//     if (!bill) return res.status(404).json({ message: "Bill not found" });
//     res.json({ bill });
//   } catch (err) {
//     console.error("Failed to fetch bill:", err);
//     res.status(500).json({ error: "Failed to fetch bill" });
//   }
// });

// // 3️⃣ Sales summary + bills (with proper timezone handling)
// // 3️⃣ Sales summary + bills (with proper timezone handling)
// // 3️⃣ Sales summary + bills (timezone-safe)
// router.get("/shops/:shopname/dashboard/sales-bills/summary", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = decodeURIComponent(req.params.shopname);
//     const period = (req.query.period || "today").toLowerCase();
//     const startParam = req.query.start;

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);

//     // ✅ Parse startParam in local timezone
//     let startDate = startParam ? new Date(startParam + "T00:00:00") : new Date();
//     let endDate = new Date(startDate);

//     if (period === "today") {
//       startDate.setHours(0, 0, 0, 0);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (period === "week") {
//       // Sunday to Saturday
//       const day = startDate.getDay(); // 0=Sunday
//       startDate.setDate(startDate.getDate() - day);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + 6);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (period === "month") {
//       startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
//     } else if (period === "year") {
//       startDate = new Date(startDate.getFullYear(), 0, 1);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(startDate.getFullYear(), 11, 31, 23, 59, 59, 999);
//     }

//     // ✅ Aggregation for totals
//     const summaryAgg = await SalesBillTenant.aggregate([
//       { $match: { date: { $gte: startDate, $lte: endDate } } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: { $ifNull: ["$netAmount", 0] } },
//           totalBills: { $sum: 1 },
//           totalItems: {
//             $sum: {
//               $sum: {
//                 $map: {
//                   input: { $ifNull: ["$items", []] },
//                   as: "item",
//                   in: { $ifNull: ["$$item.qty", 0] },
//                 },
//               },
//             },
//           },
//         },
//       },
//     ]);

//     const summary = summaryAgg[0] || { totalAmount: 0, totalBills: 0, totalItems: 0 };

//     res.json(summary);
//   } catch (err) {
//     console.error("Failed to fetch summary:", err);
//     res.status(500).json({ error: "Failed to fetch summary" });
//   }
// });

// // 4️⃣ Bills in date range (with timezone fix)
// router.get("/shops/:shopname/dashboard/sales-bills/range", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = decodeURIComponent(req.params.shopname);
//     const { start, end } = req.query;
//     if (!start || !end) return res.status(400).json({ message: "Start and end dates required" });

//     const startDate = new Date(start);
//     startDate.setHours(0, 0, 0, 0); // start of day
//     const endDate = new Date(end);
//     endDate.setHours(23, 59, 59, 999); // end of day

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);
//     const bills = await SalesBillTenant.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: -1 });

//     res.json({ bills, total: bills.length });
//   } catch (err) {
//     console.error("Failed to fetch bills by range:", err);
//     res.status(500).json({ error: "Failed to fetch bills by range" });
//   }
// });

// module.exports = router;


// server/routes/reports.js
const express = require("express");
const mongoose = require("mongoose");
const SalesBill = require("../models/SalesBill");
const authTenantOrMaster = require("../middleware/authTenantOrMaster");
const { getTenantDB } = require("../config/tenantManager");

const router = express.Router();

async function getTenantSalesBillModel(shopname) {
  const tenantConn = await getTenantDB(shopname);
  return tenantConn.model("SalesBill", SalesBill.schema);
}

// 1️⃣ All bills
router.get("/shops/:shopname/dashboard/sales-bills", authTenantOrMaster, async (req, res) => {
  try {
    const shopname = decodeURIComponent(req.params.shopname);
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const SalesBillTenant = await getTenantSalesBillModel(shopname);
    const total = await SalesBillTenant.countDocuments();
    const bills = await SalesBillTenant.find().sort({ date: -1 }).skip(skip).limit(limit);

    res.json({ bills, total, page, limit });
  } catch (err) {
    console.error("Failed to fetch bills:", err);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// 2️⃣ Single bill
router.get("/shops/:shopname/dashboard/sales-bills/:billId", authTenantOrMaster, async (req, res) => {
  try {
    const shopname = decodeURIComponent(req.params.shopname);
    const { billId } = req.params;

    const SalesBillTenant = await getTenantSalesBillModel(shopname);

    let bill = null;
    if (mongoose.Types.ObjectId.isValid(billId)) {
      bill = await SalesBillTenant.findById(billId);
    }
    if (!bill) {
      bill = await SalesBillTenant.findOne({ billNo: billId });
    }

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ bill });
  } catch (err) {
    console.error("Failed to fetch bill:", err);
    res.status(500).json({ error: "Failed to fetch bill" });
  }
});

// 3️⃣ Sales summary
// router.get("/shops/:shopname/dashboard/sales-bills/summary", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = decodeURIComponent(req.params.shopname);
//     const period = (req.query.period || "today").toLowerCase();
//     const startParam = req.query.start;
//     const now = new Date();

//     let startDate = startParam ? new Date(startParam) : new Date(now);
//     let endDate = new Date(startDate);
    
//     if (period === "today") {
//       startDate.setHours(0, 0, 0, 0);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (period === "week") {
//       const day = startDate.getDay();
//       startDate.setDate(startDate.getDate() - day);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + 6);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (period === "month") {
//       startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
//     } else if (period === "year") {
//       startDate = new Date(startDate.getFullYear(), 0, 1);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date(startDate.getFullYear(), 11, 31, 23, 59, 59, 999);
//     }

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);
//     const summaryAgg = await SalesBillTenant.aggregate([
//       { $match: { date: { $gte: startDate, $lte: endDate } } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: { $ifNull: ["$netAmount", 0] } },
//           totalBills: { $sum: 1 },
//           totalItems: {
//             $sum: {
//               $sum: {
//                 $map: {
//                   input: { $ifNull: ["$items", []] },
//                   as: "item",
//                   in: { $ifNull: ["$$item.qty", 0] },
//                 },
//               },
//             },
//           },
//         },
//       },
//     ]);

//     const summary = summaryAgg[0] || { totalAmount: 0, totalItems: 0, totalBills: 0 };
//     res.json(summary);
//   } catch (err) {
//     console.error("Failed to fetch summary:", err);
//     res.status(500).json({ error: "Failed to fetch summary" });
//   }
// });


// 3️⃣ Sales summary + bills
// 3️⃣ Sales summary + bills (updated for strict period filtering)
// router.get("/shops/:shopname/dashboard/sales-bills/summary", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = decodeURIComponent(req.params.shopname);
//     const period = (req.query.period || "today").toLowerCase();
//     const startParam = req.query.start;
//     const now = new Date();

//     let startDate = startParam ? new Date(startParam) : new Date(now);
//     let endDate = new Date(startDate);


//     if (period === "today") {
//   startDate.setHours(12, 0, 0, 0);         // today 12:00 PM
//   endDate = new Date(startDate);
//   endDate.setDate(startDate.getDate() + 1); 
//   endDate.setHours(12, 0, 0, 0);           // next day 12:00 PM
// } else if (period === "week") {
//   const day = startDate.getDay();
//   startDate.setDate(startDate.getDate() - day);
//   startDate.setHours(0, 0, 0, 0);
//   endDate = new Date(startDate);
//   endDate.setDate(startDate.getDate() + 6);
//   endDate.setHours(23, 59, 59, 999);
// } else if (period === "month") {
//   startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
//   startDate.setHours(0, 0, 0, 0);
//   endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
// } else if (period === "year") {
//   startDate = new Date(startDate.getFullYear(), 0, 1);
//   startDate.setHours(0, 0, 0, 0);
//   endDate = new Date(startDate.getFullYear(), 11, 31, 23, 59, 59, 999);
// }


//     const SalesBillTenant = await getTenantSalesBillModel(shopname);

//     // ✅ Aggregation: only data for the exact selected period
//     const summaryAgg = await SalesBillTenant.aggregate([
//       { $match: { date: { $gte: startDate, $lte: endDate } } },
//       {
//         $group: {
//           _id: ,
//           totalAmount: { $sum: { $ifNull: ["$netAmount", 0] } },
//           totalBills: { $sum: 1 },
//           totalItems: {
//             $sum: {
//               $sum: {
//                 $map: {
//                   input: { $ifNull: ["$items", []] },
//                   as: "item",
//                   in: { $ifNull: ["$$item.qty", 0] },
//                 },
//               },
//             },
//           },
//         },
//       },
//     ]);

//     const summary = summaryAgg[0] || { totalAmount: 0, totalItems: 0, totalBills: 0 };

//     // ✅ Fetch bills for the same period only
//     const bills = await SalesBillTenant.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: -1 });

//     // Respond with summary + bills
//     res.json({
//       summary,
//       bills,
//       totalBillsFetched: bills.length,
//     });
//   } catch (err) {
//     console.error("Failed to fetch summary + bills:", err);
//     res.status(500).json({ error: "Failed to fetch summary + bills" });
//   }
// });

// router.get("/shops/:shopname/dashboard/sales-bills/summary", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = decodeURIComponent(req.params.shopname);
//     const period = (req.query.period || "today").toLowerCase();
//     const startParam = req.query.start;

//     const now = new Date();
//     let startDate, endDate;

//     if (startParam) {
//       startDate = new Date(startParam);
//     } else {
//       startDate = new Date(now);
//     }

//     // Set startDate and endDate based on period
//     switch (period) {
//       case "today":
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date(startDate);
//         endDate.setHours(23, 59, 59, 999);
//         break;

//       case "week":
//         const dayOfWeek = startDate.getDay(); // 0 = Sunday
//         startDate.setDate(startDate.getDate() - dayOfWeek);
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date(startDate);
//         endDate.setDate(startDate.getDate() + 6);
//         endDate.setHours(23, 59, 59, 999);
//         break;

//       case "month":
//         startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
//         endDate.setHours(23, 59, 59, 999);
//         break;

//       case "year":
//         startDate = new Date(startDate.getFullYear(), 0, 1);
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date(startDate.getFullYear(), 11, 31);
//         endDate.setHours(23, 59, 59, 999);
//         break;

//       default:
//         // fallback to today
//         startDate.setHours(0, 0, 0, 0);
//         endDate = new Date(startDate);
//         endDate.setHours(23, 59, 59, 999);
//         break;
//     }

//     const SalesBillTenant = await getTenantSalesBillModel(shopname);

//     // ✅ Aggregation for summary
//     const summaryAgg = await SalesBillTenant.aggregate([
//       {
//         $match: {
//           date: { $gte: startDate, $lte: endDate },
//         },
//       },
//       {
//         $group: {
//           _id: null, // single summary
//           totalAmount: { $sum: { $ifNull: ["$netAmount", 0] } },
//           totalBills: { $sum: 1 },
//           totalItems: {
//             $sum: {
//               $sum: {
//                 $map: {
//                   input: { $ifNull: ["$items", []] },
//                   as: "item",
//                   in: { $ifNull: ["$$item.qty", 0] },
//                 },
//               },
//             },
//           },
//         },
//       },
//     ]);

//     const summary = summaryAgg[0] || { totalAmount: 0, totalItems: 0, totalBills: 0 };

//     // Fetch bills for the same period
//     const bills = await SalesBillTenant.find({
//       date: { $gte: startDate, $lte: endDate },
//     }).sort({ date: -1 });

//     res.json({
//       summary,
//       bills,
//       totalBillsFetched: bills.length,
//     });
//   } catch (err) {
//     console.error("Failed to fetch summary + bills:", err);
//     res.status(500).json({ error: "Failed to fetch summary + bills" });
//   }
// });

router.get("/shops/:shopname/dashboard/sales-bills/summary", authTenantOrMaster, async (req, res) => {
  try {
    const shopname = decodeURIComponent(req.params.shopname);
    const period = (req.query.period || "today").toLowerCase();
    const startParam = req.query.start;

    const now = new Date();
    let startDate, endDate;

    if (startParam) {
      startDate = new Date(startParam);
    } else {
      startDate = new Date(now);
    }

    // Set startDate and endDate in UTC
    switch (period) {
      case "today":
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setUTCHours(23, 59, 59, 999);
        break;

      case "week": {
        const dayOfWeek = startDate.getUTCDay(); // 0 = Sunday
        startDate.setUTCDate(startDate.getUTCDate() - dayOfWeek);
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 6);
        endDate.setUTCHours(23, 59, 59, 999);
        break;
      }

      case "month":
        startDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
        endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0));
        endDate.setUTCHours(23, 59, 59, 999);
        break;

      case "year":
        startDate = new Date(Date.UTC(startDate.getUTCFullYear(), 0, 1));
        endDate = new Date(Date.UTC(startDate.getUTCFullYear(), 11, 31));
        endDate.setUTCHours(23, 59, 59, 999);
        break;

      default:
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setUTCHours(23, 59, 59, 999);
        break;
    }

    const SalesBillTenant = await getTenantSalesBillModel(shopname);

    // Aggregation: sum netAmount, count bills, sum items
    const summaryAgg = await SalesBillTenant.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          netAmount_num: { $toDouble: { $ifNull: ["$netAmount", 0] } },
          items_qty_sum: {
            $sum: {
              $map: {
                input: { $ifNull: ["$items", []] },
                as: "it",
                in: { $ifNull: ["$$it.qty", 0] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalNetAmount: { $sum: "$netAmount_num" },
          totalBills: { $sum: 1 },
          totalItems: { $sum: "$items_qty_sum" }
        }
      }
    ]);

    const summary = summaryAgg[0] || { totalNetAmount: 0, totalItems: 0, totalBills: 0 };

    // Fetch bills for the same period (descending by date)
    const bills = await SalesBillTenant.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json({
      summary,
      bills,
      totalBillsFetched: bills.length
    });
  } catch (err) {
    console.error("Failed to fetch sales bill summary:", err);
    res.status(500).json({ error: "Failed to fetch sales bill summary" });
  }
});





// 4️⃣ Bills in date range
router.get("/shops/:shopname/dashboard/sales-bills/range", authTenantOrMaster, async (req, res) => {
  try {
    const shopname = decodeURIComponent(req.params.shopname);
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: "Start and end dates required" });

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const SalesBillTenant = await getTenantSalesBillModel(shopname);
    const bills = await SalesBillTenant.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: -1 });

    res.json({ bills, total: bills.length });
  } catch (err) {
    console.error("Failed to fetch bills by range:", err);
    res.status(500).json({ error: "Failed to fetch bills by range" });
  }
});




module.exports = router;
