
// // //controllers/dashboardController.js
// exports.getSalesBills = async (req, res) => {
//   try {
//     const shopId = req.shop?._id;
//     if (!shopId) return res.status(400).json({ message: "Shop context missing" });

//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       filter = "",
//       fromDate,
//       toDate,
//     } = req.query;

//     const skip = (Number(page) - 1) * Number(limit);
//     const { SalesBill } = req.tenantModels;

//     const query = { shop: shopId };

//     // ---------- Search ----------
//     if (search.trim()) {
//       const regex = new RegExp(search.trim(), "i");
//       query.$or = [
//         { billNo: regex },
//         { customerName: regex },
//         { mobile: regex },
//       ];
//     }

//     // ---------- Date Filters ----------
//     const now = new Date();
//     if (filter) {
//       switch (filter) {
//         case "today":
//           query.date = { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date(now.setHours(23, 59, 59, 999)) };
//           break;
//         case "this-week": {
//           const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
//           firstDay.setHours(0, 0, 0, 0);
//           const lastDay = new Date(firstDay);
//           lastDay.setDate(firstDay.getDate() + 6);
//           lastDay.setHours(23, 59, 59, 999);
//           query.date = { $gte: firstDay, $lte: lastDay };
//           break;
//         }
//         case "this-month": {
//           const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//           const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//           query.date = { $gte: firstDayMonth, $lte: lastDayMonth };
//           break;
//         }
//         case "custom":
//           if (fromDate && toDate) {
//             query.date = { $gte: new Date(fromDate), $lte: new Date(toDate + "T23:59:59.999Z") };
//           }
//           break;
//       }
//     }

//     // ---------- Fetch Data ----------
//     const totalBills = await SalesBill.countDocuments(query);
//     const bills = await SalesBill.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

//     res.json({
//       bills,
//       totalPages: Math.ceil(totalBills / Number(limit)),
//       totalBills,
//       page: Number(page),
//       limit: Number(limit),
//     });
//   } catch (err) {
//     console.error("❌ getSalesBills error:", err);
//     res.status(500).json({ message: "Server Error while fetching sales bills", error: err.message });
//   }
// };


// exports. getProducts = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;

//     const shopId = req.shop?._id || req.user?.shopId;
//     if (!shopId) {
//       return res.status(400).json({ message: "Shop context missing" });
//     }

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const search = req.query.search?.trim() || "";
//     const skip = (page - 1) * limit;

//     const query = { shop: shopId };

//     // ---------- 🔍 Search ----------
//     if (search) {
//       const regex = new RegExp(search, "i");
//       query.$or = [{ code: regex }, { name: regex }, { batchNo: regex }];

//       if (!isNaN(search)) {
//         query.$or.push({ minQty: Number(search) });
//       }
//     }

//     // ---------- 📊 Fetch Products ----------
//     const products = await Product.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     // ---------- 🧮 Aggregate Totals ----------
//     const agg = await Product.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: null,
//           totalStock: { $sum: "$qty" },
//           lowStockCount: { $sum: { $cond: [{ $lt: ["$qty", "$minQty"] }, 1, 0] } },
//         },
//       },
//     ]);

//     const totalStock = agg[0]?.totalStock || 0;
//     const lowStockCount = agg[0]?.lowStockCount || 0;

//     // ---------- 🔹 Count unique products by code ----------
//     const uniqueProducts = await Product.distinct("code", query);
//     const totalProducts = uniqueProducts.length;

//     const totalPages = Math.ceil(products.length / limit);

//     res.json({
//       products,         // products with batches
//       totalPages,
//       totalProducts,    // unique products count
//       totalStock,
//       lowStockCount,
//       page,
//       limit,
//     });
//   } catch (err) {
//     console.error("❌ getProducts error:", err);
//     res.status(500).json({
//       message: "Failed to fetch products",
//       error: err.message,
//     });
//   }
// };


// // ----------------------------
// // GET /products/low-stock/recent
// // ----------------------------
// exports.getRecentLowStockProducts = async (req, res) => {
//   try {
//     if (!req.shop || !req.shop._id) {
//       return res.status(400).json({ message: "Shop context missing" });
//     }

//     const { Product } = req.tenantModels;

//     const products = await Product.find({
//       shop: req.shop._id,
//       $expr: { $lte: ["$qty", "$minQty"] },
//     })
//       .sort({ updatedAt: -1 }) // Most recently updated first
//       .limit(5);

//     res.json({ products });
//   } catch (err) {
//     console.error("❌ getRecentLowStockProducts error:", err);
//     res.status(500).json({
//       message: "Failed to fetch recent low stock products",
//       error: err.message,
//     });
//   }
// };

// // ----------------------------
// // Helper to get date range
// // ----------------------------
// const getDateRange = (period) => {
//   const now = new Date();
//   let start, end;

//   switch (period) {
//     case "today":
//       start = new Date(now);
//       start.setHours(0, 0, 0, 0);
//       end = new Date(now);
//       end.setHours(23, 59, 59, 999);
//       break;

//     case "weekly":
//       // Week starts on Sunday
//       start = new Date(now);
//       start.setDate(now.getDate() - now.getDay());
//       start.setHours(0, 0, 0, 0);
//       end = new Date(start);
//       end.setDate(start.getDate() + 6);
//       end.setHours(23, 59, 59, 999);
//       break;

//     case "monthly":
//       start = new Date(now.getFullYear(), now.getMonth(), 1);
//       end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//       break;

//     default:
//       start = new Date(now);
//       start.setHours(0, 0, 0, 0);
//       end = new Date(now);
//       end.setHours(23, 59, 59, 999);
//   }

//   return { start, end };
// };

// // ----------------------------
// // GET /sales-bills/summary
// // ----------------------------
// exports.getSalesSummary = async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const shopId = req.shop._id;
//     const period = req.query.period || "today";

//     const { start, end } = getDateRange(period);

//     // Aggregate total bills and total amount (optimized)
//     const result = await SalesBill.aggregate([
//       { $match: { shop: shopId, date: { $gte: start, $lte: end } } },
//       {
//         $group: {
//           _id: null,
//           totalBills: { $sum: 1 },
//           totalAmount: { $sum: { $ifNull: ["$total", 0] } },
//         },
//       },
//     ]);

//     const summary = result[0] || { totalBills: 0, totalAmount: 0 };
//     res.json(summary);
//   } catch (err) {
//     console.error("getSalesSummary error:", err);
//     res.status(500).json({ message: "Failed to fetch sales summary", error: err.message });
//   }
// };


// // controllers/dashboardController.js
// exports.getTopSellingProducts = async (req, res) => {
//   try {
//     if (!req.shop || !req.shop._id) {
//       return res.status(400).json({ message: "Shop context missing" });
//     }

//     const { SalesBill } = req.tenantModels;

//     // Aggregate sales by product
//     const topProducts = await SalesBill.aggregate([
//       { $match: { shop: req.shop._id } },
//       { $unwind: "$items" }, // items is array of products in bill
//       { 
//         $group: { 
//           _id: "$items.product", 
//           name: { $first: "$items.name" }, 
//           totalQty: { $sum: "$items.qty" }, 
//           totalSales: { $sum: { $multiply: ["$items.qty", "$items.rate"] } } 
//         } 
//       },
//       { $sort: { totalQty: -1 } },
//       { $limit: 5 }
//     ]);

//     res.json({ topProducts });
//   } catch (err) {
//     console.error("❌ getTopSellingProducts error:", err);
//     res.status(500).json({ message: "Failed to fetch top selling products", error: err.message });
//   }
// };


// // ----------------------------
// // GET /products/low-stock
// // ----------------------------
// exports.getLowStockCount = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.shop._id;

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const countOnly = req.query.count === "true";

//     const filter = {
//       shop: shopId,
//       $expr: { $lte: ["$qty", "$minQty"] },
//     };

//     if (countOnly) {
//       const lowStockCount = await Product.countDocuments(filter);
//       return res.json({ lowStockCount });
//     }

//     const products = await Product.find(filter)
//       .sort({ qty: 1 }) // optional: lowest stock first
//       .skip((page - 1) * limit)
//       .limit(limit);

//     const total = await Product.countDocuments(filter);

//     res.json({ products, page, limit, total });
//   } catch (err) {
//     console.error("getLowStockCount error:", err);
//     res.status(500).json({ message: "Failed to fetch low stock", error: err.message });
//   }
// };


// // ----------------------------
// // PUT /products/increment-stock
// // ----------------------------
// exports.incrementStock = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.shop._id;
//     const { code, batchNo, qty } = req.body;

//     if (!code || !batchNo || !qty) {
//       return res.status(400).json({ message: "code, batchNo and qty are required" });
//     }

//     const product = await Product.findOne({ shop: shopId, code, batchNo });
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     product.qty += Number(qty);
//     await product.save();

//     res.json({ message: `Stock incremented by ${qty}`, product });
//   } catch (err) {
//     console.error("incrementStock error:", err);
//     res.status(500).json({ message: "Failed to increment stock", error: err.message });
//   }
// };

// // ----------------------------
// // PUT /products/decrement-stock
// // ----------------------------
// exports.decrementStock = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.shop._id;
//     const { code, batchNo, qty } = req.body;

//     if (!code || !batchNo || !qty) {
//       return res.status(400).json({ message: "code, batchNo and qty are required" });
//     }

//     const product = await Product.findOne({ shop: shopId, code, batchNo });
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     product.qty -= Number(qty);
//     if (product.qty < 0) product.qty = 0;
//     await product.save();

//     res.json({ message: `Stock decremented by ${qty}`, product });
//   } catch (err) {
//     console.error("decrementStock error:", err);
//     res.status(500).json({ message: "Failed to decrement stock", error: err.message });
//   }
// };




// exports.getRecentSalesBills = async (req, res) => {
//   try {
//     if (!req.shop || !req.shop._id) {
//       return res.status(400).json({ message: "Shop context missing" });
//     }

//     const { SalesBill } = req.tenantModels;

//     // Fetch last 5 bills for the dashboard
//     const bills = await SalesBill.find({ shop: req.shop._id })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     res.json({ bills });
//   } catch (err) {
//     console.error("❌ getRecentSalesBills error:", err);
//     res.status(500).json({
//       message: "Failed to fetch recent sales bills",
//       error: err.message,
//     });
//   }
// };



// controllers/dashboardController.js

const mongoose = require("mongoose");

// ----------------------------
// Helpers
// ----------------------------
const getDateRange = (period) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case "today":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;

    case "weekly":
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    default:
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

const getShopId = (req) => {
  return req.shop?._id || req.user?.shopId;
};

// ----------------------------
// Sales Summary
// GET /dashboard/sales-bills/summary?period=today
// ----------------------------
exports.getSalesSummary = async (req, res) => {
  try {
    const shopId = getShopId(req);
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const period = req.query.period || "today";
    const { start, end } = getDateRange(period);
    const { SalesBill } = req.tenantModels;

    const result = await SalesBill.aggregate([
      { $match: { shop: shopId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalBills: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ["$total", 0] } },
        },
      },
    ]);

    const summary = result[0] || { totalBills: 0, totalAmount: 0 };
    res.json(summary);
  } catch (err) {
    console.error("❌ getSalesSummary error:", err);
    res.status(500).json({ message: "Failed to fetch sales summary", error: err.message });
  }
};

// ----------------------------
// Fetch recent sales bills (last 5)
// GET /dashboard/sales-bills/recent
// ----------------------------
exports.getRecentSalesBills = async (req, res) => {
  try {
    const shopId = getShopId(req);
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const { SalesBill } = req.tenantModels;
    const bills = await SalesBill.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ bills });
  } catch (err) {
    console.error("❌ getRecentSalesBills error:", err);
    res.status(500).json({ message: "Failed to fetch recent sales bills", error: err.message });
  }
};

// ----------------------------
// Fetch all sales bills (with filters)
// GET /dashboard/sales-bills
// ----------------------------
exports.getSalesBills = async (req, res) => {
  try {
    const shopId = getShopId(req);
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

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

    const query = { shop: shopId };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { billNo: regex },
        { customerName: regex },
        { mobile: regex },
      ];
    }

    const now = new Date();
    if (filter) {
      switch (filter) {
        case "today":
          query.date = { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date(now.setHours(23, 59, 59, 999)) };
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
          const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          query.date = { $gte: firstDayMonth, $lte: lastDayMonth };
          break;
        }
        case "custom":
          if (fromDate && toDate) {
            query.date = { $gte: new Date(fromDate), $lte: new Date(toDate + "T23:59:59.999Z") };
          }
          break;
      }
    }

    const totalBills = await SalesBill.countDocuments(query);
    const bills = await SalesBill.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    res.json({
      bills,
      totalPages: Math.ceil(totalBills / Number(limit)),
      totalBills,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("❌ getSalesBills error:", err);
    res.status(500).json({ message: "Server Error while fetching sales bills", error: err.message });
  }
};

// ----------------------------
// Fetch products
// GET /dashboard/product-total
// ----------------------------
exports.getProducts = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = getShopId(req);
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const query = { shop: shopId };
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ code: regex }, { name: regex }, { batchNo: regex }];
      if (!isNaN(search)) query.$or.push({ minQty: Number(search) });
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const agg = await Product.aggregate([
      { $match: query },
      { $group: { _id: null, totalStock: { $sum: "$qty" }, lowStockCount: { $sum: { $cond: [{ $lt: ["$qty", "$minQty"] }, 1, 0] } } } },
    ]);

    const totalStock = agg[0]?.totalStock || 0;
    const lowStockCount = agg[0]?.lowStockCount || 0;
    const uniqueProducts = await Product.distinct("code", query);
    const totalProducts = uniqueProducts.length;
    const totalPages = Math.ceil(products.length / limit);

    res.json({
      products,
      totalPages,
      totalProducts,
      totalStock,
      lowStockCount,
      page,
      limit,
    });
  } catch (err) {
    console.error("❌ getProducts error:", err);
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// ----------------------------
// Low stock
// GET /dashboard/products/low-stock
// ----------------------------
exports.getLowStockCount = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = getShopId(req);
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const countOnly = req.query.count === "true";

    const filter = { shop: shopId, $expr: { $lte: ["$qty", "$minQty"] } };

    if (countOnly) {
      const lowStockCount = await Product.countDocuments(filter);
      return res.json({ lowStockCount });
    }

    const products = await Product.find(filter)
      .sort({ qty: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(filter);
    res.json({ products, page, limit, total });
  } catch (err) {
    console.error("❌ getLowStockCount error:", err);
    res.status(500).json({ message: "Failed to fetch low stock", error: err.message });
  }
};

// ----------------------------
// Recent low-stock products
// GET /dashboard/products/low-stock/recent
// ----------------------------
exports.getRecentLowStockProducts = async (req, res) => {
  try {
    const shopId = getShopId(req);
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const { Product } = req.tenantModels;
    const products = await Product.find({
      shop: shopId,
      $expr: { $lte: ["$qty", "$minQty"] },
    })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({ products });
  } catch (err) {
    console.error("❌ getRecentLowStockProducts error:", err);
    res.status(500).json({ message: "Failed to fetch recent low stock products", error: err.message });
  }
};

// ----------------------------
// Top selling products
// GET /dashboard/products/top-selling
// ----------------------------
exports.getTopSellingProducts = async (req, res) => {
  try {
    const shopId = getShopId(req);
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const { SalesBill } = req.tenantModels;

    const topProducts = await SalesBill.aggregate([
      { $match: { shop: shopId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.qty" },
          totalSales: { $sum: { $multiply: ["$items.qty", "$items.rate"] } },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    res.json({ topProducts });
  } catch (err) {
    console.error("❌ getTopSellingProducts error:", err);
    res.status(500).json({ message: "Failed to fetch top selling products", error: err.message });
  }
};

// ----------------------------
// Stock Management
// ----------------------------
// PUT /dashboard/products/increment-stock
exports.incrementStock = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = getShopId(req);
    const { code, batchNo, qty } = req.body;
    if (!code || !batchNo || !qty) return res.status(400).json({ message: "code, batchNo, qty required" });

    const product = await Product.findOne({ shop: shopId, code, batchNo });
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.qty += Number(qty);
    await product.save();
    res.json({ message: `Stock incremented by ${qty}`, product });
  } catch (err) {
    console.error("❌ incrementStock error:", err);
    res.status(500).json({ message: "Failed to increment stock", error: err.message });
  }
};

// PUT /dashboard/products/decrement-stock
exports.decrementStock = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = getShopId(req);
    const { code, batchNo, qty } = req.body;
    if (!code || !batchNo || !qty) return res.status(400).json({ message: "code, batchNo, qty required" });

    const product = await Product.findOne({ shop: shopId, code, batchNo });
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.qty -= Number(qty);
    if (product.qty < 0) product.qty = 0;
    await product.save();
    res.json({ message: `Stock decremented by ${qty}`, product });
  } catch (err) {
    console.error("❌ decrementStock error:", err);
    res.status(500).json({ message: "Failed to decrement stock", error: err.message });
  }
};







