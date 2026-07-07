// ===================================================
// controllers/donationController.js - Donation Logic
// ===================================================
const Donation = require("../models/Donation");
const Case = require("../models/Case");

// @desc    Record a donation pledge
// @route   POST /api/donations
// @access  Private (donor)
const createDonation = async (req, res) => {
  try {
    const { caseId, amount, message, isAnonymous } = req.body;

    if (!caseId || !amount || isNaN(amount) || Number(amount) < 50) {
      return res.status(400).json({ success: false, message: "Valid case ID and amount (min Rs. 50) are required." });
    }

    // Check if case exists and is verified
    const caseItem = await Case.findById(caseId);
    if (!caseItem || caseItem.status !== "verified") {
      return res.status(400).json({ success: false, message: "Case not found or not verified." });
    }

    // Create donation record
    const donation = await Donation.create({
      donor: req.user.id,
      case: caseId,
      amount: Number(amount),
      message: message || "",
      isAnonymous: isAnonymous || false,
    });

    // Update the case's amountRaised
    caseItem.amountRaised = (caseItem.amountRaised || 0) + Number(amount);

    // If fully funded, mark as fulfilled
    if (caseItem.amountRaised >= caseItem.amountNeeded) {
      caseItem.status = "fulfilled";
    }
    await caseItem.save();

    res.status(201).json({
      success: true,
      message: "Donation pledge recorded! Please transfer directly to beneficiary's account.",
      donation,
    });
  } catch (error) {
    console.error("Donation error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get donations made by logged-in donor
// @route   GET /api/donations/my
// @access  Private (donor)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate("case", "title category status")
      .sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { createDonation, getMyDonations };
