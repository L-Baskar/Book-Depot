

// //server/server.js
// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const { connectMasterDB } = require("./config/db");
// const masterAuth = require("./middleware/masterAuth"); 

// const tenantDataRoutes = require("./routes/tenantDataRoutes");

// dotenv.config();
// connectMasterDB();

// const app = express();
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(express.json());

// // ----------------------------
// // Master routes
// // ----------------------------
// app.use("/api/master/auth", require("./routes/masterAuthRoutes"));
// app.use("/api/master/users", require("./middleware/masterAuth"), require("./routes/masterUser"));
// app.use("/api/shops/public", require("./routes/shopPublicRoutes"));
// app.use("/api/shops", require("./middleware/masterAuth"), require("./routes/shopRoutes"));

// // ----------------------------
// // Tenant routes
// // ----------------------------
// app.use("/api/tenant/auth", require("./routes/tenantAuthRoutes")); // public
// app.use("/api/users", require("./middleware/masterAuth"), require("./routes/userRoutes"));


// app.use("/api/tenant", require("./routes/tenantDataRoutes"));


// app.use("/api/orders", require("./middleware/tenantMiddleware"), require("./routes/orderRoutes"));
// app.use("/api/products", require("./middleware/tenantAuth"), require("./routes/productRoutes"));
// app.use("/api/customers", require("./middleware/tenantAuth"), require("./routes/customerRoutes"));
// app.use("/api/sales", require("./middleware/tenantMiddleware"), require("./routes/salesBillRoutes"));
// app.use("/api/categories", require("./middleware/tenantMiddleware"), require("./routes/categoryRoutes"));


// const dashboardRoutes = require("./routes/dashboardRoutes");
// app.use("/api", dashboardRoutes, tenantDataRoutes);


// // ----------------------------
// // Error handler
// // ----------------------------
// app.use((err, req, res, next) => {
//   console.error("❌ Error:", err);
//   res.status(500).json({ message: "Internal Server Error" });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // ✅ Needed for socket.io
const { Server } = require("socket.io");
const { connectMasterDB } = require("./config/db");
const masterAuth = require("./middleware/masterAuth"); 

dotenv.config();
connectMasterDB();

const app = express();
const server = http.createServer(app); // wrap express app
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// Make io available in requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ----------------------------
// Master routes
// ----------------------------
app.use("/api/master/auth", require("./routes/masterAuthRoutes"));
app.use("/api/master/users", require("./middleware/masterAuth"), require("./routes/masterUser"));
app.use("/api/shops/public", require("./routes/shopPublicRoutes"));
app.use("/api/shops", require("./middleware/masterAuth"), require("./routes/shopRoutes"));

// ----------------------------
// Tenant routes
// ----------------------------
app.use("/api/tenant/auth", require("./routes/tenantAuthRoutes")); // public
app.use("/api/users", require("./middleware/masterAuth"), require("./routes/userRoutes"));
app.use("/api/tenant", require("./routes/tenantDataRoutes"));
app.use("/api/orders", require("./middleware/tenantMiddleware"), require("./routes/orderRoutes"));
app.use("/api/products", require("./middleware/tenantAuth"), require("./routes/productRoutes"));
app.use("/api/customers", require("./middleware/tenantAuth"), require("./routes/customerRoutes"));
app.use("/api/sales", require("./middleware/tenantMiddleware"), require("./routes/salesBillRoutes"));
app.use("/api/categories", require("./middleware/tenantMiddleware"), require("./routes/categoryRoutes"));

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api", dashboardRoutes, require("./routes/tenantDataRoutes"));

// ----------------------------
// WebSocket connection
// ----------------------------
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});



// ✅ Import route files
const reportsRoutes = require("./routes/reports");

// ✅ Mount routes
app.use("/api", reportsRoutes);
// ----------------------------
// Error handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
