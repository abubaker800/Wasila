// ===================================================
// controllers/caseController.js
// NEW: 3 consecutive rejections = user banned
// ===================================================
const Case = require("../models/Case");
const Donation = require("../models/Donation");
const User = require("../models/User");
const { sendRejectionEmail, sendApprovalEmail, sendBanEmail } = require("../config/mailer");

const createCase = async (req, res) => {
  try {
    const { title, description, category, amountNeeded, paymentMethod, accountNumber, accountName } = req.body;

    // Check if user is banned
    const user = await User.findById(req.user.id);
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: "Your account is restricted. You cannot submit new cases." });
    }

    const proofDocuments = req.files
      ? req.files.map((f) => ({ filename: f.originalname, path: `/uploads/${f.filename}` }))
      : [];

    const newCase = await Case.create({
      beneficiary: req.user.id,
      title, description, category,
      amountNeeded: Number(amountNeeded),
      proofDocuments,
      paymentDetails: { method: paymentMethod, accountNumber, accountName },
    });

    res.status(201).json({ success: true, message: "Case submitted for admin review.", case: newCase });
  } catch (error) {
    console.error("Create case error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

const getVerifiedCases = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { status: "verified" };
    if (category && category !== "all") filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const cases = await Case.find(filter).populate("beneficiary", "name city").sort({ createdAt: -1 });
    res.json({ success: true, count: cases.length, cases });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate("beneficiary", "name city phone")
      .populate("reviewedBy", "name");

    if (!caseItem) return res.status(404).json({ success: false, message: "Case not found." });

    const donations = await Donation.find({ case: req.params.id }).populate("donor", "name").sort({ createdAt: -1 });
    res.json({ success: true, case: caseItem, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getMyCases = async (req, res) => {
  try {
    const cases = await Case.find({ beneficiary: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, cases });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getAllCasesAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const cases = await Case.find(filter)
      .populate("beneficiary", "name email city phone isBanned consecutiveRejections")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: cases.length, cases });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ===== KEY FUNCTION: reviewCase with ban logic =====
const reviewCase = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'verified' or 'rejected'." });
    }

    const caseItem = await Case.findById(req.params.id).populate("beneficiary", "name email phone consecutiveRejections isBanned");
    if (!caseItem) return res.status(404).json({ success: false, message: "Case not found." });

    caseItem.status = status;
    caseItem.reviewedBy = req.user.id;
    caseItem.reviewedAt = new Date();

    const beneficiary = await User.findById(caseItem.beneficiary._id);
    let userBanned = false;

    if (status === "rejected") {
      caseItem.rejectionReason = rejectionReason || "Documents could not be verified.";

      // Increment consecutive rejections counter
      beneficiary.consecutiveRejections = (beneficiary.consecutiveRejections || 0) + 1;

      // ===== BAN LOGIC: 3 consecutive rejections =====
      if (beneficiary.consecutiveRejections >= 3) {
        beneficiary.isBanned = true;
        beneficiary.isActive = false;
        beneficiary.banReason = "3 consecutive case rejections due to unverifiable documents.";
        userBanned = true;
        console.log(`🚫 User ${beneficiary.email} has been BANNED after 3 consecutive rejections.`);
      }

    } else if (status === "verified") {
      // Reset counter on approval — fresh start
      beneficiary.consecutiveRejections = 0;
    }

    await beneficiary.save();
    await caseItem.save();

    // Send email notifications
    const bEmail = caseItem.beneficiary?.email;
    const bName = caseItem.beneficiary?.name || "User";

    if (bEmail) {
      try {
        if (status === "rejected") {
          if (userBanned) {
            // Send ban notification email
            await sendBanEmail(bEmail, bName, caseItem.rejectionReason);
          } else {
            // Send normal rejection email with remaining attempts
            const remaining = 3 - beneficiary.consecutiveRejections;
            await sendRejectionEmail(bEmail, bName, caseItem.title, caseItem.rejectionReason, beneficiary.consecutiveRejections, remaining);
          }
        } else {
          await sendApprovalEmail(bEmail, bName, caseItem.title);
        }
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr.message);
      }
    }

    const responseMsg = userBanned
      ? `Case rejected. User has been BANNED after 3 consecutive rejections.`
      : `Case ${status} successfully. Email notification sent.`;

    res.json({ success: true, message: responseMsg, case: caseItem, userBanned });
  } catch (error) {
    console.error("Review case error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getStats = async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    const pendingCases = await Case.countDocuments({ status: "pending" });
    const verifiedCases = await Case.countDocuments({ status: "verified" });
    const rejectedCases = await Case.countDocuments({ status: "rejected" });
    const totalDonations = await Donation.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });

    const raisedResult = await Case.aggregate([{ $group: { _id: null, total: { $sum: "$amountRaised" } } }]);
    const totalAmountRaised = raisedResult[0]?.total || 0;

    res.json({
      success: true,
      stats: { totalCases, pendingCases, verifiedCases, rejectedCases, totalDonations, totalAmountRaised, bannedUsers },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { createCase, getVerifiedCases, getCaseById, getMyCases, getAllCasesAdmin, reviewCase, getStats };
