// // models/User.js
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   shopname: { type: String, required: true },
//   status: { type: String, enum: ["active", "inactive"], default: "active" },
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);



// // models/user.js
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   shopname: { type: String, required: true },
//   role: { type: String, default: "staff" },
//   status: { type: String, enum: ["active", "inactive"], default: "active" },
// }, { timestamps: true });



// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };


// // ⚠️ Export the SCHEMA only, NOT the model
// module.exports = userSchema;
// module.exports.schema = userSchema; 



// // models/user.js
// const mongoose = require("mongoose");
// // const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   // email: { type: String, required: true, unique: true },
//     mobileNumber: { type: String }, 
//   password: { type: String, required: true },
//   shopname: { type: String, required: true },
//   role: { type: String, default: "staff" },
//   status: { type: String, enum: ["active", "inactive"], default: "active" },
// }, { timestamps: true });

// // Hash password before save
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Instance method to match password
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   // return await bcrypt.compare(enteredPassword, this.password);
// };

// // Export schema only
// // module.exports = mongoose.model("User", userSchema);
// // module.exports.schema = userSchema;
// // module.exports = mongoose.model("User", userSchema);

// const User = mongoose.model("User", userSchema);

// module.exports = User;
// module.exports.schema = userSchema; 


// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    mobileNumber: { type: String }, // optional
    password: { type: String, required: true }, // stored as plain text
    shopname: { type: String, required: true },
    role: { type: String, default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// 🔸 Remove bcrypt hook entirely
// No pre-save hashing, password will be saved as provided

const User = mongoose.model("User", userSchema);
module.exports = User;
module.exports.schema = userSchema;
