// // models/MasterUser.js
// const mongoose = require("mongoose");

// const MasterUserSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
//   role: { type: String, enum: ["megaadmin", "manager", "user"], default: "user" },
//   shopname: String, // Tenant (e.g. Nagercoil)
//   tenantDbUri: String, // store DB URI for this user
//   status: { type: String, enum: ["active", "inactive"], default: "active" }
// });

// module.exports = mongoose.model("MasterUser", MasterUserSchema);

//  // models/MasterUser.js
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const masterUserSchema = new mongoose.Schema(
//   {
//     username: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { 
//       type: String, 
//       enum: ["megaadmin", "manager", "user"], 
//       default: "user" 
//     },
//     shopname: { type: String, required: true },
//     tenantDbUri: { type: String, required: true }
//   },
//   { timestamps: true }
// );

// // Hash password before save
// masterUserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare passwords
// masterUserSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model("MasterUser", masterUserSchema);



// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const masterUserSchema = new mongoose.Schema(
//   {
//     username: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ["megaadmin", "manager", "user"], default: "user" },
//     shopname: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// masterUserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// masterUserSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model("MasterUser", masterUserSchema);

 // models/MasterUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const masterUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["megaadmin", "manager", "user"], default: "user" },
    shopname: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

masterUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

masterUserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("MasterUser", masterUserSchema);
