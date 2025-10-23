


// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const tenantAuth = require("../middleware/authTenantOrMaster");
const {
  getSalesSummary,
  getLowStockCount,
  incrementStock,
  decrementStock,
  getSalesBills,
 getTopSellingProducts,
 getProducts,
} = require("../controllers/dashboardController");
const authTenantOrMaster = require("../middleware/authTenantOrMaster");
// const tenantDataRoutes = require("./tenantDataRoutes");
// const resolveTenantDashboard = require("../middleware/resolveTenantDashboard");

// ----------------------------
// Sales summary endpoints
// ----------------------------
router.get("/sales-bills/summary", tenantAuth, getSalesSummary);

// Fetch recent 5 sales bills (for dashboard)
router.get("/sales-bills/recent", tenantAuth, async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const shopId = req.shop?._id;
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const bills = await SalesBill.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .limit(5); // only last 5 bills

    res.json({ bills });
  } catch (err) {
    console.error("❌ recent sales error:", err);
    res.status(500).json({ message: "Failed to fetch recent bills", error: err.message });
  }
});

// Fetch full sales bills list (with pagination)
router.get("/sales-bills", tenantAuth, getSalesBills);
router.get("/product-total", tenantAuth, getProducts);
// ----------------------------
// Low Stock
// ----------------------------
router.get("/products/low-stock", tenantAuth, getLowStockCount);

// ✅ Fetch recent low-stock products (last 10)
// GET /dashboard/products/low-stock/recent
router.get("/products/low-stock/recent", authTenantOrMaster, async (req, res) => {
  try {
    if (!req.shop || !req.shop._id) {
      return res.status(400).json({ message: "Shop context missing" });
    }

    const { Product } = req.tenantModels;

    const products = await Product.find({
      shop: req.shop._id,
      $expr: { $lte: ["$qty", "$minQty"] },
    })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({ products });
  } catch (err) {
    console.error("❌ getRecentLowStockProducts error:", err);
    res.status(500).json({
      message: "Failed to fetch recent low stock products",
      error: err.message,
    });
  }
});


router.get("/products/top-selling", authTenantOrMaster, getTopSellingProducts);

// ----------------------------
// Stock management
// ----------------------------
router.put("/products/increment-stock", tenantAuth, incrementStock);
router.put("/products/decrement-stock", tenantAuth, decrementStock);


// router.use("/dashboard", tenantDataRoutes);



// Apply middleware to all dashboard routes
router.use("/shops/:shopname/dashboard", authTenantOrMaster);

// ----------------------------
// Product totals
// GET /shops/:shopname/dashboard/product-total
// ----------------------------
router.get("/shops/:shopname/dashboard/product-total", authTenantOrMaster, getProducts);

router.get("/shops/:shopname/dashboard/sales-bills/summary",authTenantOrMaster, getSalesSummary);



// Fetch recent 5 sales bills (for dashboard)
router.get("/shops/:shopname/dashboard/sales-bills/recent", authTenantOrMaster, async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const shopId = req.shop?._id;
    if (!shopId) return res.status(400).json({ message: "Shop context missing" });

    const bills = await SalesBill.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .limit(5); // only last 5 bills

    res.json({ bills });
  } catch (err) {
    console.error("❌ recent sales error:", err);
    res.status(500).json({ message: "Failed to fetch recent bills", error: err.message });
  }
});


router.get("/shops/:shopname/dashboard/sales-bills",authTenantOrMaster, getSalesBills);




// ----------------------------
// Recent low-stock products
// GET /shops/:shopname/dashboard/products/low-stock/recent
// ----------------------------
router.get("/shops/:shopname/dashboard/products/low-stock/recent", async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.shop._id;

    const products = await Product.find({ shop: shopId, $expr: { $lte: ["$qty", "$minQty"] } })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({ products });
  } catch (err) {
    console.error("❌ low-stock error:", err);
    res.status(500).json({ message: "Failed to fetch low-stock products", error: err.message });
  }
});


router.get("/shops/:shopname/dashboard/products/top-selling", authTenantOrMaster, getTopSellingProducts);
// ----------------------------
// Top-selling products
// GET /shops/:shopname/dashboard/products/top-selling
// ----------------------------
// router.get("/shops/:shopname/dashboard/products/top-selling", async (req, res) => {
//   try {
//     const { SalesBillItem, Product } = req.tenantModels;
//     const shopId = req.shop._id;

//     const topProducts = await SalesBillItem.aggregate([
//       { $match: { shop: shopId } },
//       { $group: { _id: "$product", totalQty: { $sum: "$qty" }, totalSales: { $sum: "$netAmount" } } },
//       { $sort: { totalSales: -1 } },
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: Product.collection.name,
//           localField: "_id",
//           foreignField: "_id",
//           as: "productInfo",
//         },
//       },
//       { $unwind: "$productInfo" },
//       { $project: { _id: 1, name: "$productInfo.name", totalQty: 1, totalSales: 1 } },
//     ]);

//     res.json({ topProducts });
//   } catch (err) {
//     console.error("❌ top-selling error:", err);
//     res.status(500).json({ message: "Failed to fetch top-selling products", error: err.message });
//   }
// });

// ----------------------------
// Stock increment/decrement
// PUT /shops/:shopname/dashboard/products/increment-stock
// PUT /shops/:shopname/dashboard/products/decrement-stock
// ----------------------------
router.put("/shops/:shopname/dashboard/products/increment-stock", async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.shop._id;
    const { productId, qty } = req.body;

    const product = await Product.findOne({ _id: productId, shop: shopId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.qty = (product.qty || 0) + Number(qty || 0);
    await product.save();

    res.json({ message: "Stock incremented", product });
  } catch (err) {
    console.error("❌ increment stock error:", err);
    res.status(500).json({ message: "Failed to increment stock", error: err.message });
  }
});

router.put("/shops/:shopname/dashboard/products/decrement-stock", async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.shop._id;
    const { productId, qty } = req.body;

    const product = await Product.findOne({ _id: productId, shop: shopId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.qty = Math.max(0, (product.qty || 0) - Number(qty || 0));
    await product.save();

    res.json({ message: "Stock decremented", product });
  } catch (err) {
    console.error("❌ decrement stock error:", err);
    res.status(500).json({ message: "Failed to decrement stock", error: err.message });
  }
});


module.exports = router;




// // routes/dashboardRoutes.js
// const express = require("express");
// const router = express.Router();
// const tenantAuth = require("../middleware/authTenantOrMaster");
// const {
//   getSalesSummary,
//   getLowStockCount,
//   incrementStock,
//   decrementStock,
//   getSalesBills,
//  getTopSellingProducts,
//  getProducts,
// } = require("../controllers/dashboardController");
// const authTenantOrMaster = require("../middleware/authTenantOrMaster");
// // const tenantDataRoutes = require("./tenantDataRoutes");
// // const resolveTenantDashboard = require("../middleware/resolveTenantDashboard");

// // ----------------------------
// // Sales summary endpoints
// // ----------------------------
// router.get("/sales-bills/summary", tenantAuth, getSalesSummary);

// // Fetch recent 5 sales bills (for dashboard)
// router.get("/sales-bills/recent", tenantAuth, async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const shopId = req.shop?._id;
//     if (!shopId) return res.status(400).json({ message: "Shop context missing" });

//     const bills = await SalesBill.find({ shop: shopId })
//       .sort({ createdAt: -1 })
//       .limit(5); // only last 5 bills

//     res.json({ bills });
//   } catch (err) {
//     console.error("❌ recent sales error:", err);
//     res.status(500).json({ message: "Failed to fetch recent bills", error: err.message });
//   }
// });

// // Fetch full sales bills list (with pagination)
// router.get("/sales-bills", tenantAuth, getSalesBills);
// router.get("/product-total", tenantAuth, getProducts);
// // ----------------------------
// // Low Stock
// // ----------------------------
// router.get("/products/low-stock", tenantAuth, getLowStockCount);

// // ✅ Fetch recent low-stock products (last 10)
// // GET /dashboard/products/low-stock/recent
// router.get("/products/low-stock/recent", authTenantOrMaster, async (req, res) => {
//   try {
//     if (!req.shop || !req.shop._id) {
//       return res.status(400).json({ message: "Shop context missing" });
//     }

//     const { Product } = req.tenantModels;

//     const products = await Product.find({
//       shop: req.shop._id,
//       $expr: { $lte: ["$qty", "$minQty"] },
//     })
//       .sort({ updatedAt: -1 })
//       .limit(5);

//     res.json({ products });
//   } catch (err) {
//     console.error("❌ getRecentLowStockProducts error:", err);
//     res.status(500).json({
//       message: "Failed to fetch recent low stock products",
//       error: err.message,
//     });
//   }
// });


// router.get("/products/top-selling", authTenantOrMaster, getTopSellingProducts);

// // ----------------------------
// // Stock management
// // ----------------------------
// router.put("/products/increment-stock", tenantAuth, incrementStock);
// router.put("/products/decrement-stock", tenantAuth, decrementStock);


// // router.use("/dashboard", tenantDataRoutes);



// // Apply middleware to all dashboard routes
// router.use("/shops/:shopname/dashboard", authTenantOrMaster);

// // ----------------------------
// // Product totals
// // GET /shops/:shopname/dashboard/product-total
// // ----------------------------
// router.get("/shops/:shopname/dashboard/product-total", async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.shop._id;

//     const products = await Product.find({ shop: shopId });
//     const totalProducts = products.length;
//     const totalStock = products.reduce((sum, p) => sum + (p.qty || 0), 0);
//     const lowStockItems = products.filter(p => p.qty <= (p.minQty || 0));

//     res.json({ totalProducts, totalStock, lowStockCount: lowStockItems.length, lowStockItems });
//   } catch (err) {
//     console.error("❌ product-total error:", err);
//     res.status(500).json({ message: "Failed to fetch product totals", error: err.message });
//   }
// });

// // ----------------------------
// // Sales summary
// // GET /shops/:shopname/dashboard/sales-bills/summary
// // ----------------------------
// router.get("/shops/:shopname/dashboard/sales-bills/summary", async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const shopId = req.shop._id;
//     const { period = "today" } = req.query;

//     const now = new Date();
//     let startDate = new Date(now);

//     if (period === "today") startDate.setHours(0, 0, 0, 0);
//     else if (period === "weekly") startDate.setDate(now.getDate() - 7);
//     else if (period === "monthly") startDate.setDate(now.getDate() - 30);

//     const bills = await SalesBill.find({ shop: shopId, date: { $gte: startDate } });
//     const totalBills = bills.length;
//     const totalAmount = bills.reduce((sum, b) => sum + (b.netAmount || 0), 0);

//     res.json({ totalBills, totalAmount });
//   } catch (err) {
//     console.error("❌ sales summary error:", err);
//     res.status(500).json({ message: "Failed to fetch sales summary", error: err.message });
//   }
// });

// // ----------------------------
// // Recent sales bills
// // GET /shops/:shopname/dashboard/sales-bills/recent
// // ----------------------------
// router.get("/shops/:shopname/dashboard/sales-bills/recent", async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const shopId = req.shop._id;

//     const bills = await SalesBill.find({ shop: shopId }).sort({ createdAt: -1 }).limit(5);
//     res.json({ bills });
//   } catch (err) {
//     console.error("❌ recent sales error:", err);
//     res.status(500).json({ message: "Failed to fetch recent bills", error: err.message });
//   }
// });

// // ----------------------------
// // Recent low-stock products
// // GET /shops/:shopname/dashboard/products/low-stock/recent
// // ----------------------------
// router.get("/shops/:shopname/dashboard/products/low-stock/recent", async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.shop._id;

//     const products = await Product.find({ shop: shopId, $expr: { $lte: ["$qty", "$minQty"] } })
//       .sort({ updatedAt: -1 })
//       .limit(5);

//     res.json({ products });
//   } catch (err) {
//     console.error("❌ low-stock error:", err);
//     res.status(500).json({ message: "Failed to fetch low-stock products", error: err.message });
//   }
// });

// // ----------------------------
// // Top-selling products
// // GET /shops/:shopname/dashboard/products/top-selling
// // ----------------------------
// router.get("/shops/:shopname/dashboard/products/top-selling", async (req, res) => {
//   try {
//     const { SalesBillItem, Product } = req.tenantModels;
//     const shopId = req.shop._id;

//     const topProducts = await SalesBillItem.aggregate([
//       { $match: { shop: shopId } },
//       { $group: { _id: "$product", totalQty: { $sum: "$qty" }, totalSales: { $sum: "$netAmount" } } },
//       { $sort: { totalSales: -1 } },
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: Product.collection.name,
//           localField: "_id",
//           foreignField: "_id",
//           as: "productInfo",
//         },
//       },
//       { $unwind: "$productInfo" },
//       { $project: { _id: 1, name: "$productInfo.name", totalQty: 1, totalSales: 1 } },
//     ]);

//     res.json({ topProducts });
//   } catch (err) {
//     console.error("❌ top-selling error:", err);
//     res.status(500).json({ message: "Failed to fetch top-selling products", error: err.message });
//   }
// });

// // ----------------------------
// // Stock increment/decrement
// // PUT /shops/:shopname/dashboard/products/increment-stock
// // PUT /shops/:shopname/dashboard/products/decrement-stock
// // ----------------------------
// router.put("/shops/:shopname/dashboard/products/increment-stock", async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.shop._id;
//     const { productId, qty } = req.body;

//     const product = await Product.findOne({ _id: productId, shop: shopId });
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     product.qty = (product.qty || 0) + Number(qty || 0);
//     await product.save();

//     res.json({ message: "Stock incremented", product });
//   } catch (err) {
//     console.error("❌ increment stock error:", err);
//     res.status(500).json({ message: "Failed to increment stock", error: err.message });
//   }
// });

// router.put("/shops/:shopname/dashboard/products/decrement-stock", async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.shop._id;
//     const { productId, qty } = req.body;

//     const product = await Product.findOne({ _id: productId, shop: shopId });
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     product.qty = Math.max(0, (product.qty || 0) - Number(qty || 0));
//     await product.save();

//     res.json({ message: "Stock decremented", product });
//   } catch (err) {
//     console.error("❌ decrement stock error:", err);
//     res.status(500).json({ message: "Failed to decrement stock", error: err.message });
//   }
// });


// module.exports = router;
