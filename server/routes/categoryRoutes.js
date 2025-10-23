// const express = require("express");
// const { getCategories, updateCategories } = require("../controllers/categoryController");

// const router = express.Router();

// router.get("/", getCategories);
// router.put("/", updateCategories);

// module.exports = router;



// // server/routes/categoryRoutes.js
// const express = require("express");
// const { getCategories, updateCategories } = require("../controllers/categoryController");
// const tenantAuth = require("../middleware/tenantAuth");
// const tenantMiddleware = require("../middleware/tenantMiddleware");

// const router = express.Router();

// // Attach tenantAuth + tenantMiddleware
// router.get("/", tenantAuth, tenantMiddleware, getCategories);
// router.put("/", tenantAuth, tenantMiddleware, updateCategories);

// module.exports = router;


// // server/routes/categoryRoutes.js
// const express = require("express");
// const { getCategories, updateCategories } = require("../controllers/categoryController");
// const tenantAuth = require("../middleware/tenantAuth");
// const tenantMiddleware = require("../middleware/tenantMiddleware");
// const masterAuth = require("../middleware/masterAuth");

// const router = express.Router();

// // ----------------------------
// // Tenant API (/api/categories)
// // ----------------------------
// router.get("/", tenantAuth, tenantMiddleware, getCategories);
// router.put("/", tenantAuth, tenantMiddleware, updateCategories);

// // ----------------------------
// // Master API (/api/tenant/shops/:shopId/categories)
// // ----------------------------
// router.get(
//   "/tenant/shops/:shopId/categories",
//   masterAuth,
//   getCategories
// );

// router.put(
//   "/tenant/shops/:shopId/categories",
//   masterAuth,
//   updateCategories
// );

// module.exports = router;






// server/routes/categoryRoutes.js
const express = require("express");
const { getCategories, updateCategories } = require("../controllers/categoryController");
const tenantAuth = require("../middleware/tenantAuth");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// ----------------------------
// Tenant API (/api/categories)
// ----------------------------
router.get("/", tenantAuth, tenantMiddleware, getCategories);
router.put("/", tenantAuth, tenantMiddleware, updateCategories);

module.exports = router;


