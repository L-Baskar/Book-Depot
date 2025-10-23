
//16/10/2025 17;10
// //controllers/ userController.js
// const bcrypt = require("bcryptjs");
// const Shop = require("../models/Shop");
// const { getTenantDB } = require("../config/tenantManager");
// const getTenantModels = require("../models/tenantModels");

// /**
//  * GET all tenant users across all shops
//  * (no ?shopname required anymore)
//  */
// exports.getUsers = async (req, res) => {
//   try {
//     let { search = "", status = "", page = 1, limit = 10 } = req.query;
//     page = Number(page);
//     limit = Number(limit);

//     const shops = await Shop.find({});
//     let allUsers = [];

//     // Fetch users from all tenant databases
//     for (const shop of shops) {
//       const tenantConn = await getTenantDB(shop.shopname, shop.tenantDbUri);
//       const { User } = getTenantModels(tenantConn);

//       const users = await User.find()
//         .sort({ createdAt: -1 })
//         .select("-password")
//         .lean();

//       // Tag users with shopname
//       const usersWithShop = users.map((u) => ({ ...u, shopname: shop.shopname }));
//       allUsers = [...allUsers, ...usersWithShop];
//     }

//     // Apply search filter on username, email, or shopname
//     if (search) {
//       const searchLower = search.toLowerCase();
//       allUsers = allUsers.filter(
//         (u) =>
//           (u.username && u.username.toLowerCase().includes(searchLower)) ||
//           (u.email && u.email.toLowerCase().includes(searchLower)) ||
//           (u.shopname && u.shopname.toLowerCase().includes(searchLower))
//       );
//     }

//     // Apply status filter
//     if (status) {
//       const statusLower = status.toLowerCase();
//       allUsers = allUsers.filter((u) => (u.status || "active").toLowerCase() === statusLower);
//     }

//     const totalUsers = allUsers.length;
//     const totalPages = Math.ceil(totalUsers / limit);
//     const start = (page - 1) * limit;
//     const end = start + limit;

//     const paginatedUsers = allUsers.slice(start, end);

//     res.json({
//       users: paginatedUsers,
//       totalUsers,
//       totalPages,
//       page,
//     });
//   } catch (err) {
//     console.error("getUsers error:", err);
//     res.status(500).json({ message: "Failed to fetch users", error: err.message });
//   }
// };



// /**
//  * ADD tenant user (requires shopname in body)
//  */
// exports.addUser = async (req, res) => {
//   try {
//     const { username, email, password, role, shopname } = req.body;
//     if (!username || !email || !password || !role || !shopname)
//       return res.status(400).json({ message: "All fields required" });

//     const shop = await Shop.findOne({ shopname });
//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
//     const { User } = getTenantModels(tenantConn);

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ message: "Email already exists" });

//     // const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       username,
//       email,
//       password,
//       role,
//       shopname,
//       status: "active",
//     });

//     res.status(201).json({ message: "Tenant user created", user });
//   } catch (err) {
//     console.error("addUser error:", err);
//     res.status(500).json({ message: "Failed to add user" });
//   }
// };

// /**
//  * UPDATE tenant user (requires shopname in body)
//  */
// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { username, email, password, role, status, shopname } = req.body;

//     if (!shopname) return res.status(400).json({ message: "shopname required" });

//     const shop = await Shop.findOne({ shopname });
//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
//     const { User } = getTenantModels(tenantConn);

//     const user = await User.findById(id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (username) user.username = username;
//     if (email) user.email = email;
//     if (role) user.role = role;
//     if (status) user.status = status;
//     if (password) user.password = password; // ✅ plain — pre-save hook will hash

//     await user.save();
//     res.json({ message: "Tenant user updated", user });
//   } catch (err) {
//     console.error("updateUser error:", err);
//     res.status(500).json({ message: "Failed to update user" });
//   }
// };


//controllers/ userController.js
const Shop = require("../models/Shop");
const { getTenantDB } = require("../config/tenantManager");
const getTenantModels = require("../models/tenantModels");

/**
 * GET all users across shops
 */
exports.getUsers = async (req, res) => {
  try {
    let { search = "", status = "", page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const shops = await Shop.find({});
    let allUsers = [];

    for (const shop of shops) {
      const tenantConn = await getTenantDB(shop.shopname, shop.tenantDbUri);
      const { User } = getTenantModels(tenantConn);

      const users = await User.find()
        .sort({ createdAt: -1 })
        .lean();

      const usersWithShop = users.map((u) => ({ ...u, shopname: shop.shopname }));
      allUsers = [...allUsers, ...usersWithShop];
    }

    if (search) {
      const searchLower = search.toLowerCase();
      allUsers = allUsers.filter(
        (u) =>
          (u.username && u.username.toLowerCase().includes(searchLower)) ||
          (u.mobileNumber && u.mobileNumber.toLowerCase().includes(searchLower)) ||
          (u.shopname && u.shopname.toLowerCase().includes(searchLower))
      );
    }

    if (status) {
      const statusLower = status.toLowerCase();
      allUsers = allUsers.filter((u) => (u.status || "active").toLowerCase() === statusLower);
    }

    const totalUsers = allUsers.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedUsers = allUsers.slice(start, end);

    res.json({
      users: paginatedUsers,
      totalUsers,
      totalPages,
      page,
    });
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

/**
 * ADD tenant user
 */
exports.addUser = async (req, res) => {
  try {
    const { username, mobileNumber, password, role, shopname } = req.body;
    if (!username || !password || !role || !shopname)
      return res.status(400).json({ message: "All required fields must be provided" });

    const shop = await Shop.findOne({ shopname });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
    const { User } = getTenantModels(tenantConn);

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username already exists" });

    const user = await User.create({
      username,
      mobileNumber: mobileNumber || "",
      password, // plain
      role,
      shopname,
      status: "active",
    });

    res.status(201).json({ message: "Tenant user created", user });
  } catch (err) {
    console.error("addUser error:", err);
    res.status(500).json({ message: "Failed to add user" });
  }
};

/**
 * UPDATE tenant user
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, mobileNumber, password, role, status, shopname } = req.body;

    if (!shopname) return res.status(400).json({ message: "shopname required" });

    const shop = await Shop.findOne({ shopname });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
    const { User } = getTenantModels(tenantConn);

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) user.password = password;

    await user.save();
    res.json({ message: "Tenant user updated", user });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};
