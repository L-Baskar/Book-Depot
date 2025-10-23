

// // server/routes/tenantAuthRoutes.js
// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { getTenantDB } = require("../config/tenantManager");
// const getTenantModels = require("../models/tenantModels");
// const Shop = require("../models/Shop");
// const { generateTenantUri } = require("../config/tenantUtils");

// const router = express.Router();


// // ------------------------
// // Create Tenant User
// // ------------------------
// router.post("/", async (req, res) => {
//   try {
//     const { shopname, username, password, role, email } = req.body;

//     if (!shopname || !username || !password || !email) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const shop = await Shop.findOne({ shopname });
//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     const tenantDbUri = shop.tenantDbUri || generateTenantUri(shopname);
//     const tenantConn = await getTenantDB(shopname, tenantDbUri);

//     const { User } = getTenantModels(tenantConn);

//     const exists = await User.findOne({ username });
//     if (exists) return res.status(400).json({ message: "User already exists" });

//     // ✅ Hash password explicitly (important!)
//     // const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       username,
//       email,
//       password,
//       role: role || "user",
//       shopname,
//       status: "active",
//     });

//     await user.save();

//     res.status(201).json({ message: "User created", user });
//   } catch (err) {
//     console.error("❌ Tenant user creation error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });



// // ------------------------
// // Tenant User Login
// // ------------------------

// // Tenant login (PUBLIC)
// router.post("/login", async (req, res) => {
//   const { shopname, username, password } = req.body;
//   if (!shopname || !username || !password) {
//     return res.status(400).json({ message: "All fields required" });
//   }

//   // Find shop in master DB
//   const shop = await Shop.findOne({ shopname });
//   if (!shop) return res.status(404).json({ message: "Shop not found" });

//   // Connect to tenant DB
//   const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
//   const { User } = getTenantModels(tenantConn);

//   const user = await User.findOne({ username });
//   if (!user) return res.status(401).json({ message: "Invalid credentials" });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//   // Generate tenant JWT
//   const token = jwt.sign(
//     { id: user._id.toString(), shopname, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );

//   res.json({ token, user: { id: user._id, username: user.username, role: user.role, shopname } });
// });

// // ------------------------
// // Get Tenant Users (by shop from JWT)
// // ------------------------



// router.get("/", async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userRole = decoded.role;

//     // Megaadmin/manager should fetch all tenant users
//     if (userRole === "megaadmin" || userRole === "manager") {
//       const shops = await Shop.find({});
//       const allUsers = [];

//       for (const shop of shops) {
//         const tenantConn = await getTenantDB(shop.shopname, shop.tenantDbUri || generateTenantUri(shop.shopname));
//         const { User } = getTenantModels(tenantConn);
//         const users = await User.find({});
//         allUsers.push(...users);
//       }

//       return res.json(allUsers);
//     }

//     // Normal user: fetch users only from their shop
//     const shopname = decoded.shopname;
//     const shop = await Shop.findOne({ shopname });
//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     const tenantConn = await getTenantDB(shopname, shop.tenantDbUri || generateTenantUri(shopname));
//     const { User } = getTenantModels(tenantConn);

//     const users = await User.find({});
//     res.json(users);
//   } catch (err) {
//     console.error("❌ Fetch tenant users error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });



// // Admin switch user (megaadmin/manager)
// router.post("/switch", async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== "megaadmin" && decoded.role !== "manager") {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     const { shopname, username } = req.body;
//     if (!shopname || !username) {
//       return res.status(400).json({ message: "Shop and username required" });
//     }

//     const shop = await Shop.findOne({ shopname });
//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     const tenantConn = await getTenantDB(shopname, shop.tenantDbUri || generateTenantUri(shopname));
//     const { User } = getTenantModels(tenantConn);

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // ✅ Create a token for the switched user
//     const newToken = jwt.sign(
//       { id: user._id, role: user.role, shopname },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       token: newToken,
//       user: { id: user._id, username: user.username, role: user.role, shopname },
//     });
//   } catch (err) {
//     console.error("Switch user error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// module.exports = router;


// //bas

// // server/routes/tenantAuthRoutes.js
// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Shop = require("../models/Shop");
// const { getTenantDB } = require("../config/tenantManager");
// const getTenantModels = require("../models/tenantModels");

// const router = express.Router();

// // 🔑 Generate tenant JWT
// function generateTenantToken(user, shopname) {
//   return jwt.sign(
//     { id: user._id, username: user.username, role: user.role, shopname, type: "tenant" },
//     process.env.TENANT_JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// }

// /**
//  * ✅ Tenant User Registration (PUBLIC)
//  * Requires shopname to already exist in Master DB (Shop collection)
//  */
// router.post("/", async (req, res) => {
//   try {
//     const { shopname, username, password, email, role } = req.body;

//     if (!shopname || !username || !password || !email) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     // 🔍 Check shop in master DB
//     const shop = await Shop.findOne({ shopname });
//     if (!shop) {
//       return res.status(404).json({ message: `Shop '${shopname}' not found in master DB` });
//     }

//     // 🔗 Connect tenant DB
//     const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
//     const { User } = getTenantModels(tenantConn);

//     // Check duplicate user
//     const exists = await User.findOne({ $or: [{ username }, { email }] });
//     if (exists) {
//       return res.status(400).json({ message: "User already exists in tenant DB" });
//     }

//     // Hash password + save
//     // const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       username,
//       email,
//       password,
//       role: role || "user",
//       shopname,
//       status: "active",
//     });

//     // Create JWT
//     const token = generateTenantToken(newUser, shopname);

//     res.status(201).json({
//       message: "Tenant user registered successfully",
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//         role: newUser.role,
//         shopname: newUser.shopname,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error("❌ Tenant register error:", err);
//     res.status(500).json({ message: "Server error during registration" });
//   }
// });

// /**
//  * ✅ Tenant User Login (PUBLIC)
//  */
// router.post("/login", async (req, res) => {
//   try {
//     const { shopname, username, password } = req.body;

//     if (!shopname || !username || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     // 🔍 Check shop
//     const shop = await Shop.findOne({ shopname });
//     if (!shop) {
//       return res.status(404).json({ message: `Shop '${shopname}' not found in master DB` });
//     }

//     // 🔗 Connect tenant DB
//     const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
//     const { User } = getTenantModels(tenantConn);

//     // Validate user
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     // Create JWT
//     const token = generateTenantToken(user, shopname);

//     res.json({
//       message: "Login successful",
//       user: {
//         id: user._id,
//         username: user.username,
//         role: user.role,
//         shopname: user.shopname,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error("❌ Tenant login error:", err);
//     res.status(500).json({ message: "Server error during login" });
//   }
// });

// module.exports = router;

// server/routes/tenantAuthRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Shop = require("../models/Shop");
const { getTenantDB } = require("../config/tenantManager");
const getTenantModels = require("../models/tenantModels");

const router = express.Router();

// function generateTenantToken(user, shopname) {
//   return jwt.sign(
//     { id: user._id, username: user.username, role: user.role, shopname, type: "tenant" },
//     process.env.TENANT_JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// }

function generateTenantToken(user, shopname) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      shopname,
      type: "tenant",
    },
    process.env.TENANT_JWT_SECRET,
    { expiresIn: "7d" }
  );
}


router.post("/register", async (req, res) => {
  try {
    const { shopname, username, password, email, role } = req.body;
    if (!shopname || !username || !password || !email)
      return res.status(400).json({ message: "All fields required" });

    const shop = await Shop.findOne({ shopname });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
    const { User } = getTenantModels(tenantConn);

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password, role: role || "user", shopname, status: "active" });

    const token = generateTenantToken(user, shopname);

    res.status(201).json({ message: "Tenant user registered", user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// router.post("/login", async (req, res) => {
//   try {
//     const { shopname, username, password } = req.body;
//     if (!shopname || !username || !password)
//       return res.status(400).json({ message: "All fields required" });

//     const shop = await Shop.findOne({ shopname });
//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
//     const { User } = getTenantModels(tenantConn);

//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = generateTenantToken(user, shopname);

//     res.json({ message: "Login successful", user: { id: user._id, username: user.username, role: user.role, shopname }, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// ✅ Login tenant user — now blocks inactive users
router.post("/login", async (req, res) => {
  try {
    const { shopname, username, password } = req.body;
    if (!shopname || !username || !password)
      return res.status(400).json({ message: "All fields required" });

    const shop = await Shop.findOne({ shopname });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
    const { User } = getTenantModels(tenantConn);

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    // 🚫 Block inactive users
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch)
    //   return res.status(401).json({ message: "Invalid credentials" });

    const token = generateTenantToken(user, shopname);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        shopname,
        status: user.status,
      },
      token,
    });
  } catch (err) {
    console.error("Tenant login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
