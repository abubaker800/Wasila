// ===================================================
// models/User.js - User Mongoose Schema
// NEW: consecutiveRejections — 3 rejections = banned
// NEW: isBanned — blocks login via email AND phone
// NEW: phone is now required + unique
// ===================================================
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["beneficiary", "donor", "admin"],
      default: "donor",
    },
    // Phone is now REQUIRED and UNIQUE
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true,
      match: [/^((\+92|0)[0-9]{10})$/, "Please enter a valid Pakistani phone number (e.g. 03001234567)"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City name must be at least 2 characters"],
    },
    // Email verified via OTP
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Account active/inactive (admin can toggle)
    isActive: {
      type: Boolean,
      default: true,
    },
    // BANNED: 3 consecutive rejections triggers this
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: "",
    },
    // Track consecutive case rejections (resets on approval)
    consecutiveRejections: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
