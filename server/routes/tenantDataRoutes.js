

// server/routes/tenantDataRoutes.js
const express = require("express");
const Shop = require("../models/Shop");
const getNextOrderNo = require("../utils/getNextOrderNo");
const getNextBillNo = require("../utils/getNextBillNo");
const authTenantOrMaster = require("../middleware/authTenantOrMaster");
const getTenantModels = require("../models/tenantModels");
const mongoose = require("mongoose");

const router = express.Router();






// -------------------------
// Test route
// -------------------------
router.get("/", (req, res) => {
  res.json({ message: "Tenant routes are working!" });
});

// -------------------------
// Tenant collections helper (for admin/debug)
// -------------------------
const tenantCollections = [
  "User",
  "Product",
  "Customer",
  "Order",
  "SalesBill",
  "Category",
  "Counter",
  
];

// -------------------------
// Fetch all tenant data (master or tenant)
// -------------------------
router.get("/shops/:shopname", authTenantOrMaster, async (req, res) => {
  try {
    const result = {};
    for (const collection of tenantCollections) {
      if (req.tenantModels[collection]) {
        result[collection.toLowerCase()] = await req.tenantModels[collection]
          .find({ shop: req.shop._id })
          .sort({ createdAt: -1 });
      }
    }

    res.json({
      shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
      data: result,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Fetch all tenant data error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// Products CRUD
// -------------------------

// GET /api/shops/:shopname/products
router.get("/shops/:shopname/products", authTenantOrMaster, async (req, res) => {
  try {
    const { Product } = req.tenantModels;

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10); // max 100 items
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || "";

    const query = { shop: req.shop._id };

    // 🔍 Search by code / name / batch (case-insensitive)
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { batch: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /shops/:shopname/products
router.post("/shops/:shopname/products", authTenantOrMaster, async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const { code, batchNo } = req.body;

    if (!code || !batchNo) {
      return res.status(400).json({ message: "code and batchNo are required" });
    }

    // Check uniqueness per shop
    const exists = await Product.findOne({ shop: req.shop._id, code, batchNo });
    if (exists) return res.status(409).json({ message: "Product batch already exists" });

    const product = new Product({ ...req.body, shop: req.shop._id });
    await product.save();

    res.status(201).json({
      shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
      product,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
});

// PUT /shops/:shopname/products/increment-stock
router.put("/shops/:shopname/products/increment-stock", authTenantOrMaster, async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const { code, batchNo, qty, mrp, salePrice, name, category } = req.body;

    if (!code || !batchNo || !qty) {
      return res.status(400).json({ message: "Required fields missing: code, batchNo, qty" });
    }

    let product = await Product.findOneAndUpdate(
      { shop: req.shop._id, code, batchNo },
      {
        $inc: { qty: Number(qty) },
        $set: { mrp: Number(mrp), salePrice: Number(salePrice) },
      },
      { new: true }
    );

    if (!product) {
      product = new Product({
        shop: req.shop._id,
        code,
        name,
        batchNo,
        qty: Number(qty),
        mrp: Number(mrp),
        salePrice: Number(salePrice),
        category,
      });
      await product.save();
    }

    res.json({
      shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
      message: "Stock updated successfully",
      product,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Increment stock error:", err);
    res.status(500).json({ message: "Failed to increment stock", error: err.message });
  }
});

// PUT /shops/:shopname/products/decrement-stock
router.put("/shops/:shopname/products/decrement-stock", authTenantOrMaster, async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const { code, batchNo, qty } = req.body;

    if (!code || !batchNo || !qty) {
      return res.status(400).json({ message: "Required fields missing: code, batchNo, qty" });
    }

    const product = await Product.findOne({ shop: req.shop._id, code, batchNo });
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.qty = Math.max(0, product.qty - Number(qty));
    await product.save();

    res.json({
      shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
      message: "Stock decremented successfully",
      product,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Decrement stock error:", err);
    res.status(500).json({ message: "Failed to decrement stock", error: err.message });
  }
});

// PATCH /shops/:shopname/products/min-qty
router.patch("/shops/:shopname/products/min-qty", authTenantOrMaster, async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.shop?._id;
    const { code, batchNo, minQty } = req.body;

    if (!shopId) return res.status(400).json({ message: "Shop not found" });
    if (!code || !batchNo || minQty === undefined)
      return res.status(400).json({ message: "code, batchNo, minQty required" });

    if (minQty < 0) return res.status(400).json({ message: "minQty must be >= 0" });

    const updated = await Product.findOneAndUpdate(
      { shop: shopId, code, batchNo },
      { $set: { minQty: Number(minQty) } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Product batch not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update minQty error:", err);
    res.status(500).json({ message: "Failed to update minQty", error: err.message });
  }
});


// -------------------------
// Categories CRUD
// -------------------------

// GET categories for a shop
router.get("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
  try {
    const { Category } = req.tenantModels;
    const shopId = req.shop?._id;
    if (!shopId) return res.status(400).json({ message: "Shop not found" });

    let categoriesDoc = await Category.findOne({ shop: shopId });

    // If no categories exist yet, create an empty document
    if (!categoriesDoc) {
      categoriesDoc = new Category({ shop: shopId, categories: [] });
      await categoriesDoc.save();
    }

    res.json({
      shop: { _id: shopId, shopname: req.shop.shopname },
      categories: categoriesDoc.categories,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
});

// POST initial categories (only if none exist)
router.post("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
  try {
    const { Category } = req.tenantModels;
    const shopId = req.shop?._id;
    const { categories } = req.body;

    if (!shopId) return res.status(400).json({ message: "Shop not found" });
    if (!Array.isArray(categories)) return res.status(400).json({ message: "categories must be an array" });

    const existingDoc = await Category.findOne({ shop: shopId });
    if (existingDoc) return res.status(400).json({ message: "Categories already exist. Use PUT to update." });

    const categoriesDoc = new Category({ shop: shopId, categories });
    await categoriesDoc.save();

    res.status(201).json({
      shop: { _id: shopId, shopname: req.shop.shopname },
      categories: categoriesDoc.categories,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Create categories error:", err);
    res.status(500).json({ message: "Failed to create categories", error: err.message });
  }
});

// PUT to update/overwrite categories
router.put("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
  try {
    const { Category } = req.tenantModels;
    const shopId = req.shop?._id;
    const { categories } = req.body;

    if (!shopId) return res.status(400).json({ message: "Shop not found" });
    if (!Array.isArray(categories)) return res.status(400).json({ message: "categories must be an array" });

    let categoriesDoc = await Category.findOne({ shop: shopId });
    if (!categoriesDoc) {
      categoriesDoc = new Category({ shop: shopId, categories });
    } else {
      categoriesDoc.categories = categories;
    }

    await categoriesDoc.save();

    res.json({
      shop: { _id: shopId, shopname: req.shop.shopname },
      categories: categoriesDoc.categories,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Update categories error:", err);
    res.status(500).json({ message: "Failed to update categories", error: err.message });
  }
});

// -------------------------
// Products next code
// -------------------------
router.get("/shops/:shopname/products/next-code", authTenantOrMaster, async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const lastProduct = await Product.findOne({ shop: req.shop._id }).sort({ code: -1 });
    let nextCode = "P001";
    if (lastProduct && lastProduct.code) {
      const num = parseInt(lastProduct.code.replace(/\D/g, "")) || 0;
      nextCode = "P" + String(num + 1).padStart(3, "0");
    }
    res.json({ nextCode });
  } catch (err) {
    console.error("Next code error:", err);
    res.status(500).json({ message: "Failed to generate next code" });
  }
});

// -------------------------
// Orders CRUD
// -------------------------
function checkTenantModels(req, res, next) {
  if (!req.tenantModels || !req.tenantModels.Order) return res.status(500).json({ message: "Tenant models not loaded" });
  next();
}



// server/routes/tenantOrderRoutes.js
// router.get("/shops/:shopname/orders", authTenantOrMaster, checkTenantModels, async (req, res) => {
//   try {
//     const { Order } = req.tenantModels;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const { orderNo, productName, status, startDate, endDate } = req.query;

//     const query = { shop: req.shop._id };

//     // Filters
//     if (orderNo) query.orderNo = { $regex: orderNo, $options: "i" };
//     if (status) query.status = status.toLowerCase();
//     if (startDate || endDate) query.date = {};
//     if (startDate) query.date.$gte = new Date(startDate);
//     if (endDate) query.date.$lte = new Date(endDate);

//     // Product name filter (items array)
//     let orders;
//     if (productName) {
//       orders = await Order.find(query)
//         .where("items.name").regex(new RegExp(productName, "i"))
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit);
//     } else {
//       orders = await Order.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit);
//     }

//     const total = await Order.countDocuments(query);

//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       orders,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch orders error:", err);
//     res.status(500).json({ message: "Failed to fetch orders", error: err.message });
//   }
// });


// ✅ Get all orders (live filters — no populate needed)
router.get("/shops/:shopname/orders", authTenantOrMaster, checkTenantModels, async (req, res) => {
  try {
    const { Order } = req.tenantModels;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { orderNo, productName, status, startDate, endDate } = req.query;
    const query = { shop: req.shop._id };

    // 🔹 Partial Order No
    if (orderNo) query.orderNo = { $regex: orderNo, $options: "i" };

    // 🔹 Status
    if (status) query.status = status.toLowerCase();

    // 🔹 Date Range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // 🔹 Get orders
    let orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 🔹 Product name filter (live search inside items)
    if (productName) {
      const term = productName.toLowerCase();
      orders = orders.filter(order =>
        order.items?.some(item =>
          item.name?.toLowerCase().includes(term)
        )
      );
    }

    const total = await Order.countDocuments(query);

    res.json({
      shop: { _id: req.shop._id, shopname: req.shop.shopname },
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});




router.post("/shops/:shopname/orders", authTenantOrMaster, checkTenantModels, async (req, res) => {
  try {
    const { Order } = req.tenantModels;
    const shopname = req.shop?.shopname;
    if (!req.body.orderNo) req.body.orderNo = await getNextOrderNo(shopname);

    const order = new Order({ ...req.body, shop: req.shop._id });
    await order.save();

    res.status(201).json({ shop: { _id: req.shop._id, shopname }, order, accessedBy: req.authType });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

router.get("/shops/:shopname/orders/:id", authTenantOrMaster, checkTenantModels, async (req, res) => {
  try {
    const { Order } = req.tenantModels;

    // Ensure shop is resolved
    if (!req.shop?._id) return res.status(400).json({ message: "Shop not resolved" });

    const order = await Order.findOne({ _id: req.params.id, shop: req.shop._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({
      shop: { _id: req.shop._id, shopname: req.shop.shopname },
      order,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Fetch single order error:", err);
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
});

// -------------------------
// Preview next order number (no increment)
// -------------------------
router.get(
  "/shops/:shopname/orders/next-order-no/preview",
  authTenantOrMaster,
  checkTenantModels,
  async (req, res) => {
    try {
      const shopname = req.shop?.shopname;
      if (!shopname) return res.status(400).json({ message: "Shop not resolved" });

      // Call your getNextOrderNo util with increment = false
      const nextNo = await getNextOrderNo(shopname, false);
      res.json({ orderNo: nextNo });
    } catch (err) {
      console.error("Preview next order number error:", err);
      res
        .status(500)
        .json({ message: "Failed to preview next order number", error: err.message });
    }
  }
);

// -------------------------
// Update order status (tenant/master)
// -------------------------
router.put(
  "/shops/:shopname/orders/:id/status",
  authTenantOrMaster,
  checkTenantModels,
  async (req, res) => {
    try {
      const { Order } = req.tenantModels;
      const shopId = req.shop?._id;
      if (!shopId) return res.status(400).json({ message: "Shop not resolved" });

      const order = await Order.findOne({ _id: req.params.id, shop: shopId });
      if (!order) return res.status(404).json({ message: "Order not found" });

      const { status } = req.body;
      if (!status) return res.status(400).json({ message: "Status is required" });

      order.status = status;
      await order.save();

      res.json({
        shop: { _id: shopId, shopname: req.shop.shopname },
        order,
        accessedBy: req.authType,
      });
    } catch (err) {
      console.error("Update order status error:", err);
      res.status(500).json({ message: "Failed to update order status", error: err.message });
    }
  }
);


// -------------------------
// Sales Bills CRUD
// -------------------------

// GET /shops/:shopname/sales-bills
router.get("/shops/:shopname/sales-bills", authTenantOrMaster, async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const search = (req.query.search ?? "").trim();
    const filter = req.query.filter;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    const query = { shop: req.shop._id };

    // ---------- SEARCH ----------
    if (search) {
      query.$or = [
        { billNo: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    // ---------- DATE FILTER ----------
    if (filter && filter !== "custom") {
      const now = new Date();
      let start, end;
      if (filter === "today") {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (filter === "this-week") {
        const day = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (filter === "this-month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }
      query.date = { $gte: start, $lte: end };
    } else if (filter === "custom" && fromDate && toDate) {
      query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }

    // ---------- FETCH DATA ----------
    const total = await SalesBill.countDocuments(query);
    const salesBills = await SalesBill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      shop: { _id: req.shop._id, shopname: req.shop.shopname },
      salesBills,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Fetch sales bills error:", err);
    res.status(500).json({ message: "Failed to fetch sales bills", error: err.message });
  }
});





// GET sales summary
router.get("/shops/:shopname/sales-bills/summary", authTenantOrMaster, async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const shopId = req.shop._id;
    const period = req.query.period; // e.g., 'today', 'this-week', 'this-month'

    let start, end;
    const now = new Date();

    if (period === "today") {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === "this-week") {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (period === "this-month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      return res.status(400).json({ message: "Invalid period" });
    }

    const totalSales = await SalesBill.aggregate([
      { $match: { shop: shopId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }, // adjust field name
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      shop: req.shop.shopname,
      period,
      summary: totalSales[0] || { totalAmount: 0, count: 0 },
    });
  } catch (err) {
    console.error("Sales summary error:", err);
    res.status(500).json({ message: "Failed to fetch sales summary", error: err.message });
  }
});


// GET /shops/:shopname/sales-bills/next-billno
router.get("/shops/:shopname/sales-bills/next-billno", authTenantOrMaster, async (req, res) => {
  try {
    const shopname = req.params.shopname;
    const nextBillNo = await getNextBillNo(shopname); // ensure atomic handling inside function
    res.json({ nextBillNo });
  } catch (err) {
    console.error("Get next bill number error:", err.message);
    res.status(500).json({ message: `Failed to get next bill number: ${err.message}` });
  }
});

// POST /shops/:shopname/sales-bills
router.post("/shops/:shopname/sales-bills", authTenantOrMaster, async (req, res) => {
  try {
    const { SalesBill } = req.tenantModels;
    const bill = new SalesBill({ ...req.body, shop: req.shop._id });

    // Optional: Validate products exist & stock
    // Could loop over bill.items and check stock if needed

    const saved = await bill.save();
    res.status(201).json({ saved, accessedBy: req.authType });
  } catch (err) {
    console.error("Create sales bill error:", err);
    res.status(500).json({ message: "Failed to create sales bill", error: err.message });
  }
});

// router.get("/shops/:shopname/sales-bills", authTenantOrMaster, async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const search = (req.query.search ?? "").trim();
//     const filter = req.query.filter;
//     const fromDate = req.query.fromDate;
//     const toDate = req.query.toDate;

//     const query = { shop: req.shop._id };

//     // ---------- SEARCH ----------
//     if (search) {
//       query.$or = [
//         { billNo: { $regex: search, $options: "i" } },
//         { customerName: { $regex: search, $options: "i" } },
//         { mobile: { $regex: search, $options: "i" } },
//       ];
//     }

//     // ---------- DATE FILTER ----------
//     if (filter && filter !== "custom") {
//       const now = new Date();
//       let start, end;
//       if (filter === "today") {
//         start = new Date(now.setHours(0, 0, 0, 0));
//         end = new Date(now.setHours(23, 59, 59, 999));
//       } else if (filter === "this-week") {
//         const day = now.getDay();
//         start = new Date(now);
//         start.setDate(now.getDate() - day);
//         start.setHours(0, 0, 0, 0);
//         end = new Date(start);
//         end.setDate(start.getDate() + 6);
//         end.setHours(23, 59, 59, 999);
//       } else if (filter === "this-month") {
//         start = new Date(now.getFullYear(), now.getMonth(), 1);
//         end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//       }
//       query.date = { $gte: start, $lte: end };
//     } else if (filter === "custom" && fromDate && toDate) {
//       query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
//     }

//     // ---------- FETCH DATA ----------
//     const total = await SalesBill.countDocuments(query);
//     const salesBills = await SalesBill.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       salesBills,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch sales bills error:", err);
//     res.status(500).json({ message: "Failed to fetch sales bills" });
//   }
// });



// router.get("/shops/:shopname/sales-bills/next-billno", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = req.params.shopname;
//     const nextBillNo = await getNextBillNo(shopname);
//     res.json({ nextBillNo });
//   } catch (err) {
//     console.error("Get next bill number error:", err.message);
//     res.status(500).json({ message: `Failed to get next bill number: ${err.message}` });
//   }
// });

// router.post("/shops/:shopname/sales-bills", authTenantOrMaster, async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const bill = new SalesBill({ ...req.body, shop: req.shop._id });
//     const saved = await bill.save();
//     res.status(201).json({ saved, accessedBy: req.authType });
//   } catch (err) {
//     console.error("Create sales bill error:", err);
//     res.status(500).json({ message: "Failed to create sales bill" });
//   }
// });

// -------------------------
// Customers CRUD
// -------------------------
// router.get("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const customers = await Customer.find({ shop: req.shop._id }).sort({ createdAt: -1 });
//     res.json({ shop: { _id: req.shop._id, shopname: req.shop.shopname }, customers, accessedBy: req.authType });
//   } catch (err) {
//     console.error("Fetch customers error:", err);
//     res.status(500).json({ message: "Failed to fetch customers" });
//   }
// });

// router.post("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const { name, mobile, address } = req.body;
//     if (!name || !mobile) return res.status(400).json({ message: "Name and Mobile are required" });

//     const customer = new Customer({ name, mobile, address, status: "active", shop: req.shop._id });
//     await customer.save();

//     res.status(201).json({ shop: { _id: req.shop._id, shopname: req.shop.shopname }, customer, accessedBy: req.authType });
//   } catch (err) {
//     console.error("Create customer error:", err);
//     res.status(500).json({ message: "Failed to create customer" });
//   }
// });


// -------------------------
// Master Customer Routes
// -------------------------

// GET all customers for a shop
// router.get("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const customers = await Customer.find({ shop: req.shop._id }).sort({ createdAt: -1 });
//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       customers,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch customers error:", err);
//     res.status(500).json({ message: "Failed to fetch customers" });
//   }
// });

// GET all customers with pagination & status filter
router.get("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    if (!req.shop?._id) return res.status(400).json({ message: "Shop context missing" });

    const query = { shop: req.shop._id };

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      query.$or = [{ name: regex }, { mobile: regex }];
    }

    if (status) {
      query.status = status.toLowerCase();
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      shop: { _id: req.shop._id, shopname: req.shop.shopname },
      customers,
      page: Number(page),
      totalPages,
      total,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Fetch customers error:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});


// GET single customer by ID
router.get("/shops/:shopname/customers/:id", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const customer = await Customer.findOne({ _id: req.params.id, shop: req.shop._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    console.error("Fetch customer error:", err);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
});

// POST create new customer
router.post("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const { name, mobile, address, status } = req.body;
    if (!name || !mobile) return res.status(400).json({ message: "Name and Mobile are required" });

    const newCustomer = new Customer({
      name,
      mobile,
      address,
      status: status || "active",
      shop: req.shop._id,
    });

    await newCustomer.save();
    res.status(201).json({
      shop: { _id: req.shop._id, shopname: req.shop.shopname },
      customer: newCustomer,
      accessedBy: req.authType,
    });
  } catch (err) {
    console.error("Create customer error:", err);
    res.status(500).json({ message: "Failed to create customer" });
  }
});

// PUT update customer
router.put("/shops/:shopname/customers/:id", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, shop: req.shop._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Customer not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ message: "Failed to update customer" });
  }
});

// PATCH update customer status
router.patch("/shops/:shopname/customers/:id/status", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) return res.status(400).json({ message: "Invalid status value" });

    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, shop: req.shop._id },
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Customer not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// DELETE customer
router.delete("/shops/:shopname/customers/:id", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const deleted = await Customer.findOneAndDelete({ _id: req.params.id, shop: req.shop._id });
    if (!deleted) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

// -------------------------
// Users (tenant-only)
// -------------------------
router.get("/shops/:shopname/users", authTenantOrMaster, async (req, res) => {
  try {
    const { User } = req.tenantModels;
    const users = await User.find({ shop: req.shop._id }).sort({ createdAt: -1 });
    res.json({ shop: { _id: req.shop?._id, shopname: req.shop?.shopname }, users, accessedBy: req.authType });
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});







module.exports = router;



//








// //16/10/2025
// // server/routes/tenantDataRoutes.js
// const express = require("express");
// const Shop = require("../models/Shop");
// const getNextOrderNo = require("../utils/getNextOrderNo");
// const getNextBillNo = require("../utils/getNextBillNo");
// const authTenantOrMaster = require("../middleware/authTenantOrMaster");

// const router = express.Router();

// // -------------------------
// // Test route
// // -------------------------
// router.get("/", (req, res) => {
//   res.json({ message: "Tenant routes are working!" });
// });

// // -------------------------
// // Tenant collections helper (for admin/debug)
// // -------------------------
// const tenantCollections = [
//   "User",
//   "Product",
//   "Customer",
//   "Order",
//   "SalesBill",
//   "Category",
//   "Counter",
// ];

// // -------------------------
// // Fetch all tenant data (master or tenant)
// // -------------------------
// router.get("/shops/:shopname", authTenantOrMaster, async (req, res) => {
//   try {
//     const result = {};
//     for (const collection of tenantCollections) {
//       if (req.tenantModels[collection]) {
//         result[collection.toLowerCase()] = await req.tenantModels[collection]
//           .find({ shop: req.shop._id })
//           .sort({ createdAt: -1 });
//       }
//     }

//     res.json({
//       shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
//       data: result,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch all tenant data error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // -------------------------
// // Products CRUD
// // -------------------------

// // GET /api/shops/:shopname/products
// router.get("/shops/:shopname/products", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search?.trim() || "";
//     const skip = (page - 1) * limit;

//     const query = { shop: req.shop._id };

//     // 🔍 Search by code / name / batch (case-insensitive)
//     if (search) {
//       query.$or = [
//         { code: { $regex: search, $options: "i" } },
//         { name: { $regex: search, $options: "i" } },
//         { batch: { $regex: search, $options: "i" } },
//       ];
//     }

//     const total = await Product.countDocuments(query);
//     const products = await Product.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.json({
//       products,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("Fetch products error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// router.post("/shops/:shopname/products", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const product = new Product({ ...req.body, shop: req.shop._id });
//     await product.save();
//     res.status(201).json({
//       shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
//       product,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Create product error:", err);
//     res.status(500).json({ message: "Failed to create product" });
//   }
// });

// router.put("/shops/:shopname/products/increment-stock", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { code, batchNo, qty, mrp, salePrice, name, category } = req.body;
//     if (!code || !batchNo || !qty) {
//       return res.status(400).json({ message: "Required fields missing: code, batchNo, qty" });
//     }

//     let product = await Product.findOne({ shop: req.shop._id, code, batchNo });
//     if (product) {
//       product.qty += Number(qty);
//       product.mrp = Number(mrp);
//       product.salePrice = Number(salePrice);
//       await product.save();
//     } else {
//       product = new Product({
//         shop: req.shop._id,
//         code,
//         name,
//         batchNo,
//         qty: Number(qty),
//         mrp: Number(mrp),
//         salePrice: Number(salePrice),
//         category,
//       });
//       await product.save();
//     }

//     res.json({
//       shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
//       message: "Stock updated successfully",
//       product,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Increment stock error:", err);
//     res.status(500).json({ message: "Failed to increment stock" });
//   }
// });

// router.put("/shops/:shopname/products/decrement-stock", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { code, batchNo, qty } = req.body;
//     if (!code || !batchNo || !qty) {
//       return res.status(400).json({ message: "Required fields missing: code, batchNo, qty" });
//     }

//     const product = await Product.findOne({ shop: req.shop._id, code, batchNo });
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     product.qty -= Number(qty);
//     if (product.qty < 0) product.qty = 0;
//     await product.save();

//     res.json({
//       shop: { _id: req.shop?._id, shopname: req.shop?.shopname },
//       message: "Stock decremented successfully",
//       product,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Decrement stock error:", err);
//     res.status(500).json({ message: "Failed to decrement stock" });
//   }
// });

// // Update minQty for a product batch (tenant + master access)
// router.patch(
//   "/shops/:shopname/products/min-qty",
//   authTenantOrMaster,
//   async (req, res) => {
//     try {
//       console.log("req.tenantModels:", req.tenantModels);
//       console.log("req.shop:", req.shop);
//       console.log("req.body:", req.body);

//       const { Product } = req.tenantModels;
//       const shopId = req.shop?._id;
//       const { code, batchNo, minQty } = req.body;

//       if (!shopId) return res.status(400).json({ message: "Shop not found" });
//       if (!code || !batchNo || minQty === undefined) {
//         return res.status(400).json({ message: "code, batchNo, minQty required" });
//       }

//       const updated = await Product.findOneAndUpdate(
//         { shop: shopId, code, batchNo },
//         { $set: { minQty: Number(minQty) } },
//         { new: true }
//       );

//       if (!updated) {
//         return res.status(404).json({ message: "Product batch not found" });
//       }

//       res.json(updated);
//     } catch (err) {
//       console.error("Update minQty error:", err);
//       res.status(500).json({ message: "Failed to update minQty", error: err.message });
//     }
//   }
// );


// // // -------------------------
// // // Categories CRUD
// // // -------------------------
// // router.get("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
// //   try {
// //     const { Category } = req.tenantModels;
// //     const categoriesDoc = await Category.findOne({ shop: req.shop._id });
// //     res.json({
// //       shop: { _id: req.shop._id, shopname: req.shop.shopname },
// //       categories: categoriesDoc?.categories || [],
// //       accessedBy: req.authType,
// //     });
// //   } catch (err) {
// //     console.error("Fetch categories error:", err);
// //     res.status(500).json({ message: "Failed to fetch categories", error: err.message });
// //   }
// // });

// // router.post("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
// //   try {
// //     const { Category } = req.tenantModels;
// //     const { categories } = req.body;
// //     if (!Array.isArray(categories)) return res.status(400).json({ message: "categories must be an array" });

// //     let categoriesDoc = await Category.findOne({ shop: req.shop._id });
// //     if (categoriesDoc) return res.status(400).json({ message: "Categories already exist. Use PUT to update." });

// //     categoriesDoc = new Category({ shop: req.shop._id, categories });
// //     await categoriesDoc.save();

// //     res.status(201).json({
// //       shop: { _id: req.shop._id, shopname: req.shop.shopname },
// //       categories: categoriesDoc.categories,
// //       accessedBy: req.authType,
// //     });
// //   } catch (err) {
// //     console.error("Create categories error:", err);
// //     res.status(500).json({ message: "Failed to create categories", error: err.message });
// //   }
// // });

// // router.put("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
// //   try {
// //     const { Category } = req.tenantModels;
// //     const { categories } = req.body;
// //     if (!Array.isArray(categories)) return res.status(400).json({ message: "categories must be an array" });

// //     let categoriesDoc = await Category.findOne({ shop: req.shop._id });
// //     if (categoriesDoc) {
// //       categoriesDoc.categories = categories;
// //       await categoriesDoc.save();
// //     } else {
// //       categoriesDoc = new Category({ shop: req.shop._id, categories });
// //       await categoriesDoc.save();
// //     }

// //     res.json({
// //       shop: { _id: req.shop._id, shopname: req.shop.shopname },
// //       categories: categoriesDoc.categories,
// //       accessedBy: req.authType,
// //     });
// //   } catch (err) {
// //     console.error("Update categories error:", err);
// //     res.status(500).json({ message: "Failed to update categories", error: err.message });
// //   }
// // });


// // -------------------------
// // Categories CRUD
// // -------------------------

// // GET categories for a shop
// router.get("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Category } = req.tenantModels;
//     const shopId = req.shop?._id;
//     if (!shopId) return res.status(400).json({ message: "Shop not found" });

//     let categoriesDoc = await Category.findOne({ shop: shopId });

//     // If no categories exist yet, create an empty document
//     if (!categoriesDoc) {
//       categoriesDoc = new Category({ shop: shopId, categories: [] });
//       await categoriesDoc.save();
//     }

//     res.json({
//       shop: { _id: shopId, shopname: req.shop.shopname },
//       categories: categoriesDoc.categories,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch categories error:", err);
//     res.status(500).json({ message: "Failed to fetch categories", error: err.message });
//   }
// });

// // POST initial categories (only if none exist)
// router.post("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Category } = req.tenantModels;
//     const shopId = req.shop?._id;
//     const { categories } = req.body;

//     if (!shopId) return res.status(400).json({ message: "Shop not found" });
//     if (!Array.isArray(categories)) return res.status(400).json({ message: "categories must be an array" });

//     const existingDoc = await Category.findOne({ shop: shopId });
//     if (existingDoc) return res.status(400).json({ message: "Categories already exist. Use PUT to update." });

//     const categoriesDoc = new Category({ shop: shopId, categories });
//     await categoriesDoc.save();

//     res.status(201).json({
//       shop: { _id: shopId, shopname: req.shop.shopname },
//       categories: categoriesDoc.categories,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Create categories error:", err);
//     res.status(500).json({ message: "Failed to create categories", error: err.message });
//   }
// });

// // PUT to update/overwrite categories
// router.put("/shops/:shopname/categories", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Category } = req.tenantModels;
//     const shopId = req.shop?._id;
//     const { categories } = req.body;

//     if (!shopId) return res.status(400).json({ message: "Shop not found" });
//     if (!Array.isArray(categories)) return res.status(400).json({ message: "categories must be an array" });

//     let categoriesDoc = await Category.findOne({ shop: shopId });
//     if (!categoriesDoc) {
//       categoriesDoc = new Category({ shop: shopId, categories });
//     } else {
//       categoriesDoc.categories = categories;
//     }

//     await categoriesDoc.save();

//     res.json({
//       shop: { _id: shopId, shopname: req.shop.shopname },
//       categories: categoriesDoc.categories,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Update categories error:", err);
//     res.status(500).json({ message: "Failed to update categories", error: err.message });
//   }
// });

// // -------------------------
// // Products next code
// // -------------------------
// router.get("/shops/:shopname/products/next-code", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const lastProduct = await Product.findOne({ shop: req.shop._id }).sort({ code: -1 });
//     let nextCode = "P001";
//     if (lastProduct && lastProduct.code) {
//       const num = parseInt(lastProduct.code.replace(/\D/g, "")) || 0;
//       nextCode = "P" + String(num + 1).padStart(3, "0");
//     }
//     res.json({ nextCode });
//   } catch (err) {
//     console.error("Next code error:", err);
//     res.status(500).json({ message: "Failed to generate next code" });
//   }
// });

// // -------------------------
// // Orders CRUD
// // -------------------------
// function checkTenantModels(req, res, next) {
//   if (!req.tenantModels || !req.tenantModels.Order) return res.status(500).json({ message: "Tenant models not loaded" });
//   next();
// }

// // router.get("/shops/:shopname/orders", authTenantOrMaster, checkTenantModels, async (req, res) => {
// //   try {
// //     const { Order } = req.tenantModels;
// //     const orders = await Order.find({ shop: req.shop._id }).sort({ createdAt: -1 });
// //     res.json({ shop: { _id: req.shop?._id, shopname: req.shop?.shopname }, orders, accessedBy: req.authType });
// //   } catch (err) {
// //     console.error("Fetch orders error:", err);
// //     res.status(500).json({ message: "Failed to fetch orders", error: err.message });
// //   }
// // });

// // server/routes/tenantOrderRoutes.js
// router.get("/shops/:shopname/orders", authTenantOrMaster, checkTenantModels, async (req, res) => {
//   try {
//     const { Order } = req.tenantModels;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const { orderNo, productName, status, startDate, endDate } = req.query;

//     const query = { shop: req.shop._id };

//     // Filters
//     if (orderNo) query.orderNo = { $regex: orderNo, $options: "i" };
//     if (status) query.status = status.toLowerCase();
//     if (startDate || endDate) query.date = {};
//     if (startDate) query.date.$gte = new Date(startDate);
//     if (endDate) query.date.$lte = new Date(endDate);

//     // Product name filter (items array)
//     let orders;
//     if (productName) {
//       orders = await Order.find(query)
//         .where("items.name").regex(new RegExp(productName, "i"))
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit);
//     } else {
//       orders = await Order.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit);
//     }

//     const total = await Order.countDocuments(query);

//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       orders,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch orders error:", err);
//     res.status(500).json({ message: "Failed to fetch orders", error: err.message });
//   }
// });


// router.post("/shops/:shopname/orders", authTenantOrMaster, checkTenantModels, async (req, res) => {
//   try {
//     const { Order } = req.tenantModels;
//     const shopname = req.shop?.shopname;
//     if (!req.body.orderNo) req.body.orderNo = await getNextOrderNo(shopname);

//     const order = new Order({ ...req.body, shop: req.shop._id });
//     await order.save();

//     res.status(201).json({ shop: { _id: req.shop._id, shopname }, order, accessedBy: req.authType });
//   } catch (err) {
//     console.error("Create order error:", err);
//     res.status(500).json({ message: "Failed to create order", error: err.message });
//   }
// });

// router.get("/shops/:shopname/orders/:id", authTenantOrMaster, checkTenantModels, async (req, res) => {
//   try {
//     const { Order } = req.tenantModels;

//     // Ensure shop is resolved
//     if (!req.shop?._id) return res.status(400).json({ message: "Shop not resolved" });

//     const order = await Order.findOne({ _id: req.params.id, shop: req.shop._id });
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       order,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch single order error:", err);
//     res.status(500).json({ message: "Failed to fetch order", error: err.message });
//   }
// });

// // -------------------------
// // Preview next order number (no increment)
// // -------------------------
// router.get(
//   "/shops/:shopname/orders/next-order-no/preview",
//   authTenantOrMaster,
//   checkTenantModels,
//   async (req, res) => {
//     try {
//       const shopname = req.shop?.shopname;
//       if (!shopname) return res.status(400).json({ message: "Shop not resolved" });

//       // Call your getNextOrderNo util with increment = false
//       const nextNo = await getNextOrderNo(shopname, false);
//       res.json({ orderNo: nextNo });
//     } catch (err) {
//       console.error("Preview next order number error:", err);
//       res
//         .status(500)
//         .json({ message: "Failed to preview next order number", error: err.message });
//     }
//   }
// );

// // -------------------------
// // Update order status (tenant/master)
// // -------------------------
// router.put(
//   "/shops/:shopname/orders/:id/status",
//   authTenantOrMaster,
//   checkTenantModels,
//   async (req, res) => {
//     try {
//       const { Order } = req.tenantModels;
//       const shopId = req.shop?._id;
//       if (!shopId) return res.status(400).json({ message: "Shop not resolved" });

//       const order = await Order.findOne({ _id: req.params.id, shop: shopId });
//       if (!order) return res.status(404).json({ message: "Order not found" });

//       const { status } = req.body;
//       if (!status) return res.status(400).json({ message: "Status is required" });

//       order.status = status;
//       await order.save();

//       res.json({
//         shop: { _id: shopId, shopname: req.shop.shopname },
//         order,
//         accessedBy: req.authType,
//       });
//     } catch (err) {
//       console.error("Update order status error:", err);
//       res.status(500).json({ message: "Failed to update order status", error: err.message });
//     }
//   }
// );


// // ... Similarly update /confirm, /status, /delete with shop filter
// // -------------------------
// // Sales Bills CRUD
// // -------------------------


// router.get("/shops/:shopname/sales-bills", authTenantOrMaster, async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const search = (req.query.search ?? "").trim();
//     const filter = req.query.filter;
//     const fromDate = req.query.fromDate;
//     const toDate = req.query.toDate;

//     const query = { shop: req.shop._id };

//     // ---------- SEARCH ----------
//     if (search) {
//       query.$or = [
//         { billNo: { $regex: search, $options: "i" } },
//         { customerName: { $regex: search, $options: "i" } },
//         { mobile: { $regex: search, $options: "i" } },
//       ];
//     }

//     // ---------- DATE FILTER ----------
//     if (filter && filter !== "custom") {
//       const now = new Date();
//       let start, end;
//       if (filter === "today") {
//         start = new Date(now.setHours(0, 0, 0, 0));
//         end = new Date(now.setHours(23, 59, 59, 999));
//       } else if (filter === "this-week") {
//         const day = now.getDay();
//         start = new Date(now);
//         start.setDate(now.getDate() - day);
//         start.setHours(0, 0, 0, 0);
//         end = new Date(start);
//         end.setDate(start.getDate() + 6);
//         end.setHours(23, 59, 59, 999);
//       } else if (filter === "this-month") {
//         start = new Date(now.getFullYear(), now.getMonth(), 1);
//         end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//       }
//       query.date = { $gte: start, $lte: end };
//     } else if (filter === "custom" && fromDate && toDate) {
//       query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
//     }

//     // ---------- FETCH DATA ----------
//     const total = await SalesBill.countDocuments(query);
//     const salesBills = await SalesBill.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       salesBills,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch sales bills error:", err);
//     res.status(500).json({ message: "Failed to fetch sales bills" });
//   }
// });



// router.get("/shops/:shopname/sales-bills/next-billno", authTenantOrMaster, async (req, res) => {
//   try {
//     const shopname = req.params.shopname;
//     const nextBillNo = await getNextBillNo(shopname);
//     res.json({ nextBillNo });
//   } catch (err) {
//     console.error("Get next bill number error:", err.message);
//     res.status(500).json({ message: `Failed to get next bill number: ${err.message}` });
//   }
// });

// router.post("/shops/:shopname/sales-bills", authTenantOrMaster, async (req, res) => {
//   try {
//     const { SalesBill } = req.tenantModels;
//     const bill = new SalesBill({ ...req.body, shop: req.shop._id });
//     const saved = await bill.save();
//     res.status(201).json({ saved, accessedBy: req.authType });
//   } catch (err) {
//     console.error("Create sales bill error:", err);
//     res.status(500).json({ message: "Failed to create sales bill" });
//   }
// });

// // -------------------------
// // Customers CRUD
// // -------------------------
// // router.get("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
// //   try {
// //     const { Customer } = req.tenantModels;
// //     const customers = await Customer.find({ shop: req.shop._id }).sort({ createdAt: -1 });
// //     res.json({ shop: { _id: req.shop._id, shopname: req.shop.shopname }, customers, accessedBy: req.authType });
// //   } catch (err) {
// //     console.error("Fetch customers error:", err);
// //     res.status(500).json({ message: "Failed to fetch customers" });
// //   }
// // });

// // router.post("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
// //   try {
// //     const { Customer } = req.tenantModels;
// //     const { name, mobile, address } = req.body;
// //     if (!name || !mobile) return res.status(400).json({ message: "Name and Mobile are required" });

// //     const customer = new Customer({ name, mobile, address, status: "active", shop: req.shop._id });
// //     await customer.save();

// //     res.status(201).json({ shop: { _id: req.shop._id, shopname: req.shop.shopname }, customer, accessedBy: req.authType });
// //   } catch (err) {
// //     console.error("Create customer error:", err);
// //     res.status(500).json({ message: "Failed to create customer" });
// //   }
// // });


// // -------------------------
// // Master Customer Routes
// // -------------------------

// // GET all customers for a shop
// // router.get("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
// //   try {
// //     const { Customer } = req.tenantModels;
// //     const customers = await Customer.find({ shop: req.shop._id }).sort({ createdAt: -1 });
// //     res.json({
// //       shop: { _id: req.shop._id, shopname: req.shop.shopname },
// //       customers,
// //       accessedBy: req.authType,
// //     });
// //   } catch (err) {
// //     console.error("Fetch customers error:", err);
// //     res.status(500).json({ message: "Failed to fetch customers" });
// //   }
// // });

// // GET all customers with pagination & status filter
// router.get("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const { page = 1, limit = 10, search = "", status = "" } = req.query;

//     if (!req.shop?._id) return res.status(400).json({ message: "Shop context missing" });

//     const query = { shop: req.shop._id };

//     if (search) {
//       const regex = new RegExp(search, "i"); // case-insensitive
//       query.$or = [{ name: regex }, { mobile: regex }];
//     }

//     if (status) {
//       query.status = status.toLowerCase();
//     }

//     const skip = (Number(page) - 1) * Number(limit);
//     const total = await Customer.countDocuments(query);
//     const totalPages = Math.ceil(total / Number(limit));

//     const customers = await Customer.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       customers,
//       page: Number(page),
//       totalPages,
//       total,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Fetch customers error:", err);
//     res.status(500).json({ message: "Failed to fetch customers" });
//   }
// });


// // GET single customer by ID
// router.get("/shops/:shopname/customers/:id", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const customer = await Customer.findOne({ _id: req.params.id, shop: req.shop._id });
//     if (!customer) return res.status(404).json({ message: "Customer not found" });
//     res.json(customer);
//   } catch (err) {
//     console.error("Fetch customer error:", err);
//     res.status(500).json({ message: "Failed to fetch customer" });
//   }
// });

// // POST create new customer
// router.post("/shops/:shopname/customers", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const { name, mobile, address, status } = req.body;
//     if (!name || !mobile) return res.status(400).json({ message: "Name and Mobile are required" });

//     const newCustomer = new Customer({
//       name,
//       mobile,
//       address,
//       status: status || "active",
//       shop: req.shop._id,
//     });

//     await newCustomer.save();
//     res.status(201).json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       customer: newCustomer,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("Create customer error:", err);
//     res.status(500).json({ message: "Failed to create customer" });
//   }
// });

// // PUT update customer
// router.put("/shops/:shopname/customers/:id", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const updated = await Customer.findOneAndUpdate(
//       { _id: req.params.id, shop: req.shop._id },
//       req.body,
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Customer not found" });
//     res.json(updated);
//   } catch (err) {
//     console.error("Update customer error:", err);
//     res.status(500).json({ message: "Failed to update customer" });
//   }
// });

// // PATCH update customer status
// router.patch("/shops/:shopname/customers/:id/status", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const { status } = req.body;
//     if (!["active", "inactive"].includes(status)) return res.status(400).json({ message: "Invalid status value" });

//     const updated = await Customer.findOneAndUpdate(
//       { _id: req.params.id, shop: req.shop._id },
//       { status },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Customer not found" });
//     res.json(updated);
//   } catch (err) {
//     console.error("Update status error:", err);
//     res.status(500).json({ message: "Failed to update status" });
//   }
// });

// // DELETE customer
// router.delete("/shops/:shopname/customers/:id", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const deleted = await Customer.findOneAndDelete({ _id: req.params.id, shop: req.shop._id });
//     if (!deleted) return res.status(404).json({ message: "Customer not found" });
//     res.json({ message: "Customer deleted" });
//   } catch (err) {
//     console.error("Delete customer error:", err);
//     res.status(500).json({ message: "Failed to delete customer" });
//   }
// });

// // -------------------------
// // Users (tenant-only)
// // -------------------------
// router.get("/shops/:shopname/users", authTenantOrMaster, async (req, res) => {
//   try {
//     const { User } = req.tenantModels;
//     const users = await User.find({ shop: req.shop._id }).sort({ createdAt: -1 });
//     res.json({ shop: { _id: req.shop?._id, shopname: req.shop?.shopname }, users, accessedBy: req.authType });
//   } catch (err) {
//     console.error("Fetch users error:", err);
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// });

// module.exports = router;



// // <