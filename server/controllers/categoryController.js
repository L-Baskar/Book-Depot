// controllers/categoryController.js

const getCategoryModel = (req) => {
  if (req.tenantModels) return req.tenantModels.Category;
  if (req.masterModels) return req.masterModels.Category;
  throw new Error("No Category model available");
};

// --------------------
// GET Categories
// --------------------
exports.getCategories = async (req, res) => {
  try {
    const Category = getCategoryModel(req);
    const shopId = req.shop?._id || req.params.shopId; // tenant or master
    if (!shopId) return res.status(400).json({ error: "Shop ID required" });

    let cats = await Category.findOne({ shop: shopId });
    if (!cats) {
      cats = new Category({ shop: shopId, categories: [] });
      await cats.save();
    }

    res.json({ shop: shopId, categories: cats.categories });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// --------------------
// Update Categories
// --------------------
exports.updateCategories = async (req, res) => {
  try {
    const Category = getCategoryModel(req);
    const shopId = req.shop?._id || req.params.shopId; // tenant or master
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "categories must be an array" });
    }

    let cats = await Category.findOne({ shop: shopId });
    if (!cats) {
      cats = new Category({ shop: shopId, categories });
    } else {
      cats.categories = categories;
    }

    await cats.save();
    res.json({ shop: shopId, categories: cats.categories });
  } catch (err) {
    console.error("updateCategories error:", err);
    res.status(500).json({ error: "Failed to update categories" });
  }
};




// // controllers/categoryController.js

// // Helper to resolve Category model (tenant or master)
// const getCategoryModel = (req) => {
//   if (req.tenantModels) {
//     return req.tenantModels.Category;   // tenant
//   }
//   if (req.masterModels) {
//     return req.masterModels.Category;   // master
//   }
//   throw new Error("No Category model available (tenant or master missing)");
// };

// // --------------------
// // @desc Get categories
// // @route GET /api/categories (tenant)
// // @route GET /api/tenant/shops/:shopId/categories (master)
// // --------------------
// exports.getCategories = async (req, res) => {
//   try {
//     const Category = getCategoryModel(req);
//     let cats = await Category.findOne();

//     if (!cats) {
//       cats = await Category.create({ categories: [] });
//     }

//     res.json(cats.categories);
//   } catch (err) {
//     console.error("getCategories error:", err);
//     res.status(500).json({ error: "Failed to fetch categories" });
//   }
// };

// // --------------------
// // @desc Update categories (overwrite)
// // @route PUT /api/categories (tenant)
// // @route PUT /api/tenant/shops/:shopId/categories (master)
// // --------------------
// exports.updateCategories = async (req, res) => {
//   try {
//     const Category = getCategoryModel(req);
//     const { categories } = req.body;

//     let cats = await Category.findOne();

//     if (!cats) {
//       cats = new Category({ categories });
//     } else {
//       cats.categories = categories;
//     }

//     await cats.save();
//     res.json(cats.categories);
//   } catch (err) {
//     console.error("updateCategories error:", err);
//     res.status(500).json({ error: "Failed to update categories" });
//   }
// };
