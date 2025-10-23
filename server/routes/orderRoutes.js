// const express = require("express");
// const router = express.Router();
// const orderController = require("../controllers/orderController");

// // GET all orders
// router.get("/", orderController.getOrders);

// // GET single order
// router.get("/:id", orderController.getOrderById);

// // CREATE order
// router.post("/", orderController.createOrder);

// // UPDATE order
// router.put("/:id", orderController.updateOrder);

// // CONFIRM order
// router.put("/:id/confirm", orderController.confirmOrder);

// // DELETE order
// router.delete("/:id", orderController.deleteOrder);


// router.put("/:id/status", updateOrderStatus);

// module.exports = router;




// // routes/orderRoutes.js
// const express = require("express");
// const router = express.Router();
// const orderController = require("../controllers/orderController");
// const tenantMiddleware = require("../middleware/tenantMiddleware");

// // Apply tenantMiddleware to all order routes
// router.use(tenantMiddleware);

// // GET all orders
// router.get("/", orderController.getOrders);

// // GET single order
// router.get("/:id", orderController.getOrderById);

// // CREATE order
// router.post("/", orderController.createOrder);

// // UPDATE order
// router.put("/:id", orderController.updateOrder);

// // CONFIRM order
// router.put("/:id/confirm", orderController.confirmOrder);

// // UPDATE order status
// router.put("/:id/status", orderController.updateOrderStatus);

// // DELETE order
// router.delete("/:id", orderController.deleteOrder);

// module.exports = router;



// // const express = require("express");
// // const router = express.Router();
// // const orderController = require("../controllers/orderController");

// // // GET all orders
// // router.get("/", orderController.getOrders);

// // // GET single order
// // router.get("/:id", orderController.getOrderById);

// // // CREATE order
// // router.post("/", orderController.createOrder);

// // // UPDATE order
// // router.put("/:id", orderController.updateOrder);

// // // CONFIRM order
// // router.put("/:id/confirm", orderController.confirmOrder);

// // // UPDATE order status
// // router.put("/:id/status", orderController.updateOrderStatus); // ✅ FIX

// // // DELETE order
// // router.delete("/:id", orderController.deleteOrder);

// // module.exports = router;


// // routes/orderRoutes.js
// const express = require("express");
// const router = express.Router();
// const orderController = require("../controllers/orderController");
// const tenantAuth = require("../middleware/tenantAuth");
// const tenantMiddleware = require("../middleware/tenantMiddleware");

// // const getNextOrderNo = require("../utils/getNextOrderNo");

// // ✅ Protect all order routes
// router.use(tenantAuth, tenantMiddleware);

// // GET all orders
// router.get("/", orderController.getOrders);

// // GET single order
// router.get("/:id", orderController.getOrderById);

// // CREATE order
// router.post("/", orderController.createOrder);

// // UPDATE order
// router.put("/:id", orderController.updateOrder);

// // CONFIRM order
// router.put("/:id/confirm", orderController.confirmOrder);

// // UPDATE order status
// router.put("/:id/status", orderController.updateOrderStatus);

// // DELETE order
// router.delete("/:id", orderController.deleteOrder);

// router.use(tenantAuth, tenantMiddleware);

// // GET next order number
// // routes/orderRoutes.js
// // routes/orderRoutes.js
// router.get("/next-order-no", tenantAuth, tenantMiddleware, async (req, res) => {
//   try {
//     // Make sure shop info exists
//     if (!req.shop || !req.shop.shopname) {
//       console.log("Shop not found in req:", req.shop);
//       return res.status(400).json({ message: "Shop not found" });
//     }

//     const getNextOrderNo = require("../utils/getNextOrderNo");
//     const nextNo = await getNextOrderNo(req.shop.shopname);

//     return res.json({ orderNo: nextNo });
//   } catch (err) {
//     console.error("next-order-no error:", err);
//     return res.status(500).json({
//       message: "Failed to get next order number",
//       error: err.message || err.toString(),
//     });
//   }
// });



// // GET single order
// router.get("/:id", orderController.getOrderById);

// module.exports = router;
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const tenantAuth = require("../middleware/tenantAuth");
const tenantMiddleware = require("../middleware/tenantMiddleware");

// ✅ All routes protected
router.use(tenantAuth, tenantMiddleware);

router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.put("/:id", orderController.updateOrder);
router.put("/:id/confirm", orderController.confirmOrder);
router.put("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);

// ✅ Safe endpoint for preview (no increment)
router.get("/next-order-no/preview", orderController.previewNextOrderNo);

module.exports = router;
