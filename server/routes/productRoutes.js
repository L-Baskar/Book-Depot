

// // server/routes/productRoutes.js
// const express = require("express");
// const router = express.Router();
// const productController = require("../controllers/productController");
// const tenantAuth = require("../middleware/tenantAuth");




// // All routes are tenant-protected
// router.get("/", tenantAuth, productController.getProducts);
// router.post("/", tenantAuth, productController.createProduct);

// // Stock management
// router.put("/increment-stock", tenantAuth, productController.incrementStock);
// router.put("/decrement-stock", tenantAuth, productController.decrementStock);

// // Batches & product codes
// router.get("/batches/:code", tenantAuth, productController.getBatchesByCode);
// router.get("/code/:code", tenantAuth, productController.getProductByCode);
// router.get("/next-code", tenantAuth, productController.getNextProductCode);
// router.get("/search", tenantAuth, productController.searchProductsByName);

// module.exports = router;



// server/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const tenantAuth = require("../middleware/tenantAuth");

// All routes are tenant-protected
router.get("/", tenantAuth, productController.getProducts);
router.post("/", tenantAuth, productController.createProduct);

// Stock management
router.put("/increment-stock", tenantAuth, productController.incrementStock);
router.put("/decrement-stock", tenantAuth, productController.decrementStock);

// Batches & product codes
router.get("/batches/:code", tenantAuth, productController.getBatchesByCode);
router.get("/code/:code", tenantAuth, productController.getProductByCode);
router.get("/next-code", tenantAuth, productController.getNextProductCode);

// server/routes/productRoutes.js,
router.get("/count", async (req, res) => {
  const shopname = req.query.shopname;
  const count = await Product.countDocuments({ shop: shopname });
  res.json({ count });
});


// Update minimum quantity
router.patch("/min-qty", tenantAuth, productController.updateMinQty);





module.exports = router;
