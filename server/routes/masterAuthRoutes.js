// // routes/masterAuthRoutes.js
// const express = require("express");
// const router = express.Router();
// const MasterUser = require("../models/MasterUser");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // MasterUser Login
// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       return res.status(400).json({ message: "Missing credentials" });
//     }

//     const masterUser = await MasterUser.findOne({ username });
//     if (!masterUser) {
//       return res.status(404).json({ message: "User not found in master DB" });
//     }

//     const isMatch = await bcrypt.compare(password, masterUser.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: masterUser._id, username, role: masterUser.role, shopname: masterUser.shopname },
//       process.env.JWT_SECRET
//     );

//     res.json({ token, user: masterUser });
//   } catch (err) {
//     console.error("Master login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// // --- Master User Creation ---
// router.post("/register", async (req, res) => {
//   try {
//     const { username, email, password, shopname, role } = req.body;

//     // 1️⃣ Validate required fields
//     if (!username || !email || !password || !shopname) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // 2️⃣ Check if user already exists
//     const existingUser = await MasterUser.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists in master DB" });
//     }

//     // 3️⃣ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 4️⃣ Create user in Master DB
//     const masterUser = await MasterUser.create({
//       username,
//       email,
//       password: hashedPassword,
//       shopname,
//       role: role || "user",
//       status: "active",
//     });

//     // 5️⃣ Optionally, generate JWT immediately
//     const token = jwt.sign(
//       { id: masterUser._id, username, role: masterUser.role, shopname: masterUser.shopname },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(201).json({ user: masterUser, token });
//   } catch (err) {
//     console.error("Master user creation error:", err);
//     res.status(500).json({ message: "Failed to create master user" });
//   }
// });

// module.exports = router;



// // routes/masterAuthRoutes.js
// const express = require("express");
// const router = express.Router();
// const MasterUser = require("../models/MasterUser");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const masterModels = require("../middleware/masterModels");
// const masterAuth = require("../middleware/masterAuth");
// const productController = require("../controllers/productController");
// const categoryController = require("../controllers/categoryController");



// function generateToken(user) {
//   return jwt.sign(
//     { id: user._id, username: user.username, role: user.role, shopname: user.shopname },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" } // ⏳ expires in 1 hour
//   );
// }





// // -----------------------------
// // 🆕 Master User Registration
// // -----------------------------
// router.post("/register", async (req, res) => {
//   try {
//     const { username, email, password, shopname, role } = req.body;

//     if (!username || !email || !password || !shopname) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const existingUser = await MasterUser.findOne({
//       $or: [{ username }, { email }],
//     });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists in master DB" });
//     }

//     // const hashedPassword = await bcrypt.hash(password, 10);

//     const masterUser = await MasterUser.create({
//       username,
//       email,
//       password,
//       shopname,
//       role: role || "user",
//       status: "active",
//     });

//     const token = generateToken(masterUser);

//     res.status(201).json({
//       user: {
//         id: masterUser._id,
//         username: masterUser.username,
//         role: masterUser.role,
//         shopname: masterUser.shopname,
//         email: masterUser.email,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error("Master user creation error:", err);
//     res.status(500).json({ message: "Failed to create master user" });
//   }
// });






// // -----------------------------
// // 🔐 Master User Login
// // -----------------------------

// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       return res.status(400).json({ message: "Missing credentials" });
//     }

//     const masterUser = await MasterUser.findOne({ username });
//     if (!masterUser) {
//       return res.status(404).json({ message: "User not found in master DB" });
//     }

//     // Use the model method instead of raw bcrypt.compare
//     const isMatch = await masterUser.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const token = generateToken(masterUser);

//     res.json({
//       token,
//       user: {
//         id: masterUser._id,
//         username: masterUser.username,
//         role: masterUser.role,
//         shopname: masterUser.shopname,
//         email: masterUser.email,
//       },
//     });
//   } catch (err) {
//     console.error("Master login error:", err);
//     res.status(500).json({ message: "Server error during login" });
//   }
// });


// router.get(
//   "/tenant/shops/:shopId/products",
//   masterAuth,
//   masterModels,        // ✅ attach models
//   productController.getProducts
// );

// router.get(
//   "/tenant/shops/:shopId/categories",
//   masterAuth,
//   masterModels,
//   categoryController.getCategories
// );


// module.exports = router;


// routes/masterAuthRoutes.js
const express = require("express");
const router = express.Router();
const MasterUser = require("../models/MasterUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Shop = require("../models/Shop");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, shopname: user.shopname, type: "master" },
    process.env.MASTER_JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Master Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, shopname, role } = req.body;
    if (!username || !email || !password || !shopname)
      return res.status(400).json({ message: "Missing required fields" });

    const existingUser = await MasterUser.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // const hashedPassword = await bcrypt.hash(password, 10);
    const masterUser = await MasterUser.create({ username, email, password, shopname, role });

    const token = generateToken(masterUser);
    res.status(201).json({ user: { id: masterUser._id, username, email, shopname, role }, token });
  } catch (err) {
    res.status(500).json({ message: "Failed to create master user" });
  }
});

// Master Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const masterUser = await MasterUser.findOne({ username });
    if (!masterUser) return res.status(404).json({ message: "User not found" });

    const isMatch = await masterUser.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = generateToken(masterUser);
    res.json({ token, user: { id: masterUser._id, username, email: masterUser.email, role: masterUser.role, shopname: masterUser.shopname } });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
