const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [50, "Minimum donation is Rs. 50"],
    },
    
    message: {
      type: String,
      maxlength: [300, "Message cannot exceed 300 characters"],
      default: "",
    },
   
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
