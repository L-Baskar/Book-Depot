

// // server/middleware/tenantMiddleware.js
// const jwt = require("jsonwebtoken");
// const Shop = require("../models/Shop");
// const { getTenantDB } = require("../config/tenantManager");
// const getTenantModels = require("../models/tenantModels");

// module.exports = async (req, res, next) => {
//   try {
//     // 1️⃣ Check for Authorization header
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized - No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     // 2️⃣ Verify JWT
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
//     }

//     const { id: userId, shopname } = decoded;

//     if (!userId || !shopname) {
//       return res.status(401).json({ message: "Unauthorized - Invalid token payload" });
//     }

//     // 3️⃣ Check if shop exists
//     const shop = await Shop.findOne({ shopname });
//     if (!shop) return res.status(404).json({ message: `Shop '${shopname}' not found` });

//     // 4️⃣ Connect to tenant DB
//     let tenantConn;
//     try {
//       tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
//     } catch (err) {
//       console.error("Tenant DB connection error:", err);
//       return res.status(500).json({ message: "Failed to connect to tenant database" });
//     }

//     // 5️⃣ Load tenant models
//     const { User } = getTenantModels(tenantConn);

//     // 6️⃣ Check if user exists in tenant DB
//     const user = await User.findById(userId);
//     if (!user) return res.status(401).json({ message: "Unauthorized - User not found in tenant DB" });

//     // 7️⃣ Attach user and tenant info to request
//     req.user = { id: user._id, username: user.username, role: user.role, shopname };
//     req.tenant = tenantConn;
//     req.tenantModels = getTenantModels(tenantConn);

//     next(); // ✅ Everything ok, proceed
//   } catch (err) {
//     console.error("tenantMiddleware unexpected error:", err);
//     res.status(500).json({ message: "Internal server error in tenantMiddleware" });
//   }
// };


//server/middleware/tenantMiddleware.js


const jwt = require("jsonwebtoken");
const Shop = require("../models/Shop");
const { getTenantDB } = require("../config/tenantManager");
const getTenantModels = require("../models/tenantModels");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized - No token provided" });

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.TENANT_JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Unauthorized - Invalid tenant token" });
    }

    if (decoded.type !== "tenant")
      return res.status(401).json({ message: "Unauthorized - Wrong token type" });

    const { id: userId, shopname } = decoded;

    const shop = await Shop.findOne({ shopname });
    if (!shop) return res.status(404).json({ message: `Shop '${shopname}' not found` });

    const tenantConn = await getTenantDB(shopname, shop.tenantDbUri);
    const { User } = getTenantModels(tenantConn);

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Unauthorized - Tenant user not found" });

    req.user = { id: user._id, username: user.username, role: user.role, shopname };
       req.shop = shop;
    req.tenant = tenantConn;
    req.tenantModels = getTenantModels(tenantConn);

    next();
  } catch (err) {
    console.error("tenantMiddleware error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
