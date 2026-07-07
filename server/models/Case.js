// ===================================================
// models/Case.js - Aid Case Mongoose Schema
// ===================================================
const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    // Who posted this case
    beneficiary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Case title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
    },
    // Category of Islamic charity
    category: {
      type: String,
      enum: ["Zakat", "Sadqa", "Ushr", "Fitrana", "General Charity"],
      required: [true, "Category is required"],
    },
    // Amount needed in PKR
    amountNeeded: {
      type: Number,
      required: [true, "Required amount is required"],
      min: [100, "Minimum amount is Rs. 100"],
    },
    // Amount pledged so far by donors
    amountRaised: {
      type: Number,
      default: 0,
    },
    // Uploaded proof documents (file paths)
    proofDocuments: [
      {
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Payment details so donor can transfer directly
    paymentDetails: {
      method: {
        type: String,
        enum: ["Bank Account", "JazzCash", "EasyPaisa"],
        required: [true, "Payment method is required"],
      },
      accountNumber: {
        type: String,
        required: [true, "Account number is required"],
        trim: true,
      },
      accountName: {
        type: String,
        required: [true, "Account holder name is required"],
        trim: true,
      },
    },
    // Admin approval status
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "fulfilled"],
      default: "pending",
    },
    // Admin rejection reason
    rejectionReason: {
      type: String,
      default: "",
    },
    // Admin who approved/rejected
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
