


// // controllers/productController.js
// const mongoose = require("mongoose");

// // ----------------------
// // Get all products (by shop)
// // ----------------------
// const getProducts = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId } = req.params;

//     const products = await Product.find({ shop: shopId }).sort({ createdAt: -1 });
//     res.json(products);
//   } catch (err) {
//     console.error("getProducts error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ----------------------
// // Create or update product batch
// // ----------------------
// const createProduct = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId } = req.params;

//     const {
//       code,
//       name,
//       shortName,
//       category,
//       batchNo,
//       qty = 0,
//       mrp = 0,
//       minQty = 0,
//       salePrice = 0,
//       taxPercent = 0,
//       taxMode = "exclusive",
//     } = req.body;

//     if (!code || !batchNo) {
//       return res.status(400).json({ message: "Code and Batch No are required" });
//     }

//     const existing = await Product.findOne({ shop: shopId, code, batchNo });

//     if (existing) {
//       existing.qty = (existing.qty || 0) + Number(qty);
//       existing.mrp = mrp || existing.mrp;
//       existing.salePrice = salePrice || existing.salePrice;
//       existing.taxPercent = taxPercent || existing.taxPercent;
//       existing.taxMode = taxMode || existing.taxMode;
//       existing.minQty = minQty || existing.minQty;

//       const updated = await existing.save();
//       return res.status(200).json(updated);
//     }

//     const product = new Product({
//       shop: shopId,
//       code,
//       name,
//       shortName: shortName || name,
//       category,
//       batchNo,
//       qty,
//       mrp,
//       salePrice,
//       taxPercent,
//       taxMode,
//       minQty,
//     });

//     const saved = await product.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error("createProduct error:", err);
//     res.status(500).json({ message: "Failed to create or update product" });
//   }
// };

// // ----------------------
// // Generate next product code (shop scoped)
// // ----------------------
// const getNextProductCode = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId } = req.params;

//     const all = await Product.find({ shop: shopId }, "code");

//     let nextCode = "P001";
//     if (all.length) {
//       const maxNum = all.reduce((max, p) => {
//         const num = parseInt(p.code.replace(/\D/g, ""), 10) || 0;
//         return Math.max(max, num);
//       }, 0);
//       nextCode = "P" + String(maxNum + 1).padStart(3, "0");
//     }

//     res.json({ nextCode });
//   } catch (err) {
//     console.error("getNextProductCode error:", err);
//     res.status(500).json({ message: "Failed to generate code" });
//   }
// };

// // ----------------------
// // Get all batches by product code (shop scoped)
// // ----------------------
// const getProductByCode = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId, code } = req.params;

//     const batches = await Product.find({ shop: shopId, code }).sort({ createdAt: -1 });
//     if (!batches.length) {
//       return res.status(404).json({ message: "No product found" });
//     }
//     res.json(batches);
//   } catch (err) {
//     console.error("getProductByCode error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ----------------------
// // Autocomplete search by name (shop scoped)
// // ----------------------
// const searchProductsByName = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId } = req.params;
//     const q = req.query.q || "";

//     if (!q.trim()) return res.json([]);

//     const products = await Product.find({
//       shop: shopId,
//       name: { $regex: q, $options: "i" },
//     }).limit(10);

//     res.json(products);
//   } catch (err) {
//     console.error("searchProductsByName error:", err);
//     res.status(500).json({ message: "Search failed" });
//   }
// };

// // ----------------------
// // Get batches by code (shop scoped)
// // ----------------------
// const getBatchesByCode = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId, code } = req.params;

//     const batches = await Product.find({ shop: shopId, code }).sort({ createdAt: -1 });
//     if (!batches.length) {
//       return res.status(404).json({ message: "No batches found" });
//     }
//     res.json(batches);
//   } catch (err) {
//     console.error("getBatchesByCode error:", err);
//     res.status(500).json({ message: "Failed to fetch batches" });
//   }
// };

// // ----------------------
// // Decrement stock (shop scoped)
// // ----------------------
// const decrementStock = async (req, res) => {
//   let session;
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId } = req.params;
//     const conn = Product.db;

//     let items = req.body?.items;
//     if (!items) {
//       const { code, batchNo, qty } = req.body || {};
//       if (!code || !batchNo || typeof qty === "undefined") {
//         return res.status(400).json({ message: "Missing items or missing code/batchNo/qty" });
//       }
//       items = [{ code, batchNo, qty }];
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ message: "Invalid items array" });
//     }

//     session = await conn.startSession();
//     session.startTransaction();

//     const updated = [];

//     for (const it of items) {
//       const { code, batchNo } = it;
//       const qty = Number(it.qty || 0);

//       if (!code || !batchNo || qty <= 0) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({ message: "Invalid item (code/batchNo/qty)" });
//       }

//       const doc = await Product.findOneAndUpdate(
//         { shop: shopId, code, batchNo, qty: { $gte: qty } },
//         { $inc: { qty: -Math.abs(qty) } },
//         { new: true, session }
//       );

//       if (!doc) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           message: `Not enough stock or product not found for shop=${shopId}, code=${code}, batch=${batchNo}`,
//         });
//       }

//       updated.push({ code, batchNo, qtyChanged: qty });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.json({ message: "Stock decremented", updated });
//   } catch (err) {
//     console.error("decrementStock error:", err);
//     if (session) {
//       await session.abortTransaction();
//       session.endSession();
//     }
//     res.status(500).json({ message: "Server error decrementing stock", error: err.message });
//   }
// };

// // ----------------------
// // Increment stock (shop scoped)
// // ----------------------
// const incrementStock = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { shopId } = req.params;
//     const { code, batchNo, qty } = req.body;

//     if (!code || !batchNo || typeof qty === "undefined") {
//       return res.status(400).json({ message: "Missing code/batchNo/qty" });
//     }

//     const doc = await Product.findOneAndUpdate(
//       { shop: shopId, code, batchNo },
//       { $inc: { qty: Math.abs(Number(qty)) } },
//       { new: true }
//     );

//     if (!doc) return res.status(404).json({ message: "Product not found" });

//     return res.json({ message: "Stock incremented", product: doc });
//   } catch (err) {
//     console.error("incrementStock error:", err);
//     return res.status(500).json({ message: "Server error incrementing stock" });
//   }
// };

// module.exports = {
//   getProducts,
//   createProduct,
//   getNextProductCode,
//   getProductByCode,
//   searchProductsByName,
//   getBatchesByCode,
//   decrementStock,
//   incrementStock,
// };





// // server/controllers/productController.js
// const mongoose = require("mongoose");

// // Assuming Product model is tenant-based
// const getProducts = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const products = await Product.find().sort({ createdAt: -1 });
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch products", error: err.message });
//   }
// };

// const createProduct = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const data = req.body;

//     // If product with same code + batch exists, just update qty
//     let existing = await Product.findOne({ code: data.code, batchNo: data.batchNo });

//     if (existing) {
//       existing.qty += Number(data.qty || 0);
//       await existing.save();
//       return res.json(existing);
//     }

//     // Otherwise create new batch/product
//     const product = new Product({
//       code: data.code,
//       shortName: data.shortName,
//       name: data.name,
//       category: data.category,
//       batchNo: data.batchNo,
//       qty: data.qty || 0,
//       minQty: data.minQty || 0,
//       mrp: data.mrp || 0,
//       salePrice: data.salePrice || 0,
//       taxPercent: data.taxPercent || 0,
//       taxMode: data.taxMode || "exclusive",
//     });

//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to create product", error: err.message });
//   }
// };

// const getBatchesByCode = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const batches = await Product.find({ code: req.params.code });
//     res.json(batches);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch batches", error: err.message });
//   }
// };

// const getProductByCode = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const product = await Product.findOne({ code: req.params.code });
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch product", error: err.message });
//   }
// };

// const getNextProductCode = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const last = await Product.findOne().sort({ createdAt: -1 });
//     let nextCode = "P001";
//     if (last && last.code) {
//       const num = parseInt(last.code.replace(/\D/g, "")) || 0;
//       nextCode = "P" + String(num + 1).padStart(3, "0");
//     }
//     res.json({ nextCode });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to generate code", error: err.message });
//   }
// };

// // Stock adjustments
// const incrementStock = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { items } = req.body;

//     for (const item of items) {
//       await Product.updateOne(
//         { code: item.code, batchNo: item.batchNo },
//         { $inc: { qty: item.qty } }
//       );
//     }
//     res.json({ message: "Stock incremented" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to increment stock", error: err.message });
//   }
// };

// const decrementStock = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const { items } = req.body;

//     for (const item of items) {
//       await Product.updateOne(
//         { code: item.code, batchNo: item.batchNo },
//         { $inc: { qty: -Math.abs(item.qty) } }
//       );
//     }
//     res.json({ message: "Stock decremented" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to decrement stock", error: err.message });
//   }
// };

// module.exports = {
//   getProducts,
//   createProduct,
//   getBatchesByCode,
//   getProductByCode,
//   getNextProductCode,
//   incrementStock,
//   decrementStock,
// };


// server/controllers/productController.js
const mongoose = require("mongoose");

// ----------------------
// Get all products for tenant shop
// ----------------------




//16/10/25 22:37
// const getProducts = async (req, res) => {
//   try {
//     const { Product } = req.tenantModels;
//     const shopId = req.user.shopId; // ✅ tenant shop id

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const search = req.query.search?.trim() || "";
//     const skip = (page - 1) * limit;

//     const query = { shop: shopId };

//     if (search) {
//       // Build regex search for string fields
//       const regex = new RegExp(search, "i");
//       query.$or = [
//         { code: regex },
//         { name: regex },
//         { batchNo: regex },
//       ];

//       // Also match minQty if search is a number
//       if (!isNaN(search)) {
//         query.$or.push({ minQty: Number(search) });
//       }
//     }

//     const totalProducts = await Product.countDocuments(query);
//     const products = await Product.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const totalPages = Math.ceil(totalProducts / limit);

//     res.json({
//       products,
//       totalPages,
//       totalProducts,
//     });
//   } catch (err) {
//     console.error("getProducts error:", err);
//     res.status(500).json({ message: "Failed to fetch products", error: err.message });
//   }
// };

// ==========================
// ✅ Fetch All Products
// ==========================



const getProducts = async (req, res) => {
  try {
    const { Product } = req.tenantModels;

    const shopId = req.shop?._id || req.user?.shopId;
    if (!shopId) {
      return res.status(400).json({ message: "Shop context missing" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const query = { shop: shopId };

    // ---------- 🔍 Search ----------
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ code: regex }, { name: regex }, { batchNo: regex }];

      if (!isNaN(search)) {
        query.$or.push({ minQty: Number(search) });
      }
    }

    // ---------- 📊 Fetch Products ----------
    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ---------- 🧮 Aggregate Totals ----------
    const agg = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$qty" },
          lowStockCount: {
            $sum: { $cond: [{ $lt: ["$qty", "$minQty"] }, 1, 0] },
          },
        },
      },
    ]);

    const totalStock = agg[0]?.totalStock || 0;
    const lowStockCount = agg[0]?.lowStockCount || 0;

    const totalPages = Math.ceil(totalProducts / limit);

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
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};


// const getProducts = async (req, res) => {
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





const createProduct = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.user.shopId;
    const data = req.body;

    if (!data.code || !data.batchNo) {
      return res.status(400).json({ message: "Code and batchNo are required" });
    }

    // If product with same code + batch exists, just update qty
    let existing = await Product.findOne({ shop: shopId, code: data.code, batchNo: data.batchNo });
    if (existing) {
      existing.qty += Number(data.qty || 0);
      await existing.save();
      return res.json(existing);
    }

    // Otherwise create new product/batch
    const product = new Product({
      shop: shopId,
      code: data.code,
      shortName: data.shortName || data.name,
      name: data.name,
      category: data.category,
      batchNo: data.batchNo,
      qty: data.qty || 0,
      minQty: data.minQty || 0,
      mrp: data.mrp || 0,
      salePrice: data.salePrice || 0,
      taxPercent: data.taxPercent || 0,
      taxMode: data.taxMode || "exclusive",
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

// ----------------------
// Get all batches for a product code
// ----------------------
const getBatchesByCode = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.user.shopId;
    const code = req.params.code;

    const batches = await Product.find({ shop: shopId, code }).sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch batches", error: err.message });
  }
};

// ----------------------
// Get a single product by code (latest batch)
// ----------------------
const getProductByCode = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.user.shopId;
    const code = req.params.code;

    const product = await Product.findOne({ shop: shopId, code }).sort({ createdAt: -1 });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

// ----------------------
// Generate next product code
// ----------------------
const getNextProductCode = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.user.shopId;

    const last = await Product.findOne({ shop: shopId }).sort({ createdAt: -1 });
    let nextCode = "P001";
    if (last && last.code) {
      const num = parseInt(last.code.replace(/\D/g, "")) || 0;
      nextCode = "P" + String(num + 1).padStart(3, "0");
    }

    res.json({ nextCode });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate code", error: err.message });
  }
};




// ----------------------
// Increment stock
// ----------------------
const incrementStock = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.user.shopId;
    let { items } = req.body;

    // Normalize to array
    if (!Array.isArray(items)) {
      if (!req.body.code || !req.body.batchNo || typeof req.body.qty === "undefined") {
        return res.status(400).json({ message: "Missing code/batchNo/qty" });
      }
      items = [req.body];
    }

    for (const item of items) {
      const qtyToAdd = Math.max(0, Number(item.qty) || 0);
      if (qtyToAdd === 0) continue;

      await Product.updateOne(
        { shop: shopId, code: item.code, batchNo: item.batchNo },
        { $inc: { qty: qtyToAdd } }
      );
    }

    res.json({ message: "Stock incremented successfully" });
  } catch (err) {
    console.error("Increment stock error:", err);
    res.status(500).json({ message: "Failed to increment stock", error: err.message });
  }
};


// ----------------------
// Decrement stock
// ----------------------
const decrementStock = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.user.shopId;
    let { items } = req.body;

    // Normalize to array
    if (!Array.isArray(items)) {
      if (!req.body.code || !req.body.batchNo || typeof req.body.qty === "undefined") {
        return res.status(400).json({ message: "Missing code/batchNo/qty" });
      }
      items = [req.body];
    }

    for (const item of items) {
      const qtyToReduce = Math.max(0, Number(item.qty) || 0);
      if (qtyToReduce === 0) continue;

      // 🧠 Prevent negative stock: check current stock first
      const product = await Product.findOne({
        shop: shopId,
        code: item.code,
        batchNo: item.batchNo,
      });

      if (!product) continue;

      const newQty = Math.max(0, (product.qty || 0) - qtyToReduce);

      await Product.updateOne(
        { shop: shopId, code: item.code, batchNo: item.batchNo },
        { $set: { qty: newQty } }
      );
    }

    res.json({ message: "Stock decremented successfully" });
  } catch (err) {
    console.error("Decrement stock error:", err);
    res.status(500).json({ message: "Failed to decrement stock", error: err.message });
  }
};

const updateMinQty = async (req, res) => {
  try {
    const { Product } = req.tenantModels;
    const shopId = req.user.shopId;
    const { code, batchNo, minQty } = req.body;

    const updated = await Product.findOneAndUpdate(
      { shop: shopId, code, batchNo },
      { $set: { minQty } },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update minQty", error: err.message });
  }
};



module.exports = {
  getProducts,
  createProduct,
  getBatchesByCode,
  getProductByCode,
  getNextProductCode,
  incrementStock,
  decrementStock,
  updateMinQty,
 
};


// Master APIs

// Create master user: POST /api/master/auth ✅ works

// Login master user: POST /api/master/auth/login ✅ works

// Get token: ✅ works

// Access: /api/master/users, /api/shops ❌ not working

// Tenant APIs

// Create tenant user: POST /api/tenant/auth ✅ works

// Login tenant user: POST /api/tenant/auth/login ✅ works

// Get token: ✅ works

// Access: /api/products, /api/categories, /api/orders, /api/customers ❌ not working