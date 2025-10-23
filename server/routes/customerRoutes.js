


// // routes/customerRoutes.js
// const express = require("express");
// const router = express.Router();
// const tenantAuth = require("../middleware/tenantAuth");
// const tenantMiddleware = require("../middleware/tenantMiddleware");

// // All customer routes must use tenantAuth + tenantMiddleware
// router.use(tenantAuth, tenantMiddleware);

// // @desc   Get all customers
// // @route  GET /api/customers
// router.get("/", async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const customers = await Customer.find().sort({ createdAt: -1 });
//     res.json(customers);
//   } catch (err) {
//     console.error("get customers error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc   Add new customer
// // @route  POST /api/customers
// router.post("/", async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const { name, mobile, address } = req.body;

//     if (!name || !mobile) {
//       return res.status(400).json({ message: "Name and Mobile are required" });
//     }

//     const customer = new Customer({ name, mobile, address, status: "active" });
//     const saved = await customer.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error("add customer error:", err);
//     res.status(500).json({ message: "Failed to add customer" });
//   }
// });

// // @desc   Get single customer
// // @route  GET /api/customers/:id
// router.get("/:id", async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const customer = await Customer.findById(req.params.id);
//     if (!customer) return res.status(404).json({ message: "Not found" });
//     res.json(customer);
//   } catch (err) {
//     console.error("get customer error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // @desc   Update customer status (active/inactive)
// // @route  PATCH /api/customers/:id/status
// router.patch("/:id/status", async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const { status } = req.body;
//     if (!["active", "inactive"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status value" });
//     }

//     const customer = await Customer.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!customer) return res.status(404).json({ message: "Not found" });

//     res.json(customer);
//   } catch (err) {
//     console.error("update status error:", err);
//     res.status(500).json({ message: "Failed to update status" });
//   }
// });

// // @desc   Delete customer
// // @route  DELETE /api/customers/:id
// router.delete("/:id", async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const customer = await Customer.findByIdAndDelete(req.params.id);
//     if (!customer) return res.status(404).json({ message: "Not found" });
//     res.json({ message: "Customer deleted" });
//   } catch (err) {
//     console.error("delete customer error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const tenantAuth = require("../middleware/tenantAuth");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authTenantOrMaster = require("../middleware/authTenantOrMaster");

// All routes require tenant auth + middleware
router.use(tenantAuth, tenantMiddleware);

// -------------------------
// Customer Routes
// -------------------------

// // GET all customers for this shop
// router.get("/", authTenantOrMaster, async (req, res) => {
//   try {
//     const { Customer } = req.tenantModels;
//     const customers = await Customer.find({ shop: req.shop._id }).sort({ createdAt: -1 });
//     res.json({
//       shop: { _id: req.shop._id, shopname: req.shop.shopname },
//       customers,
//       accessedBy: req.authType,
//     });
//   } catch (err) {
//     console.error("getCustomers error:", err);
//     res.status(500).json({ message: "Failed to fetch customers" });
//   }
// });



// GET /api/customers
router.get("/", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const shopId = req.shop._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim().toLowerCase(); // "active" / "inactive"
    const skip = (page - 1) * limit;

    // Build query
    const query = { shop: shopId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "active") query.status = { $ne: "inactive" };
    if (status === "inactive") query.status = "inactive";

    const totalCustomers = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCustomers / limit);

    res.json({   shop: { _id: req.shop._id, shopname: req.shop.shopname }, customers, page, totalPages, totalCustomers, accessedBy: req.authType });
  } catch (err) {
    console.error("getCustomers error:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});


// GET single customer by ID
router.get("/:id", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const customer = await Customer.findOne({ _id: req.params.id, shop: req.shop._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    console.error("getCustomerById error:", err);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
});

// POST new customer
router.post("/", authTenantOrMaster, async (req, res) => {
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
    console.error("createCustomer error:", err);
    res.status(500).json({ message: "Failed to create customer" });
  }
});

// PUT update customer
router.put("/:id", authTenantOrMaster, async (req, res) => {
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
    console.error("updateCustomer error:", err);
    res.status(500).json({ message: "Failed to update customer" });
  }
});

// DELETE customer
router.delete("/:id", authTenantOrMaster, async (req, res) => {
  try {
    const { Customer } = req.tenantModels;
    const deleted = await Customer.findOneAndDelete({ _id: req.params.id, shop: req.shop._id });
    if (!deleted) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error("deleteCustomer error:", err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

// PATCH update customer status
router.patch("/:id/status", authTenantOrMaster, async (req, res) => {
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
    console.error("updateStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;
