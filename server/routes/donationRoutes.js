// ===================================================
// routes/donationRoutes.js - Donation Routes
// ===================================================
const express = require("express");
const router = express.Router();
const { createDonation, getMyDonations } = require("../controllers/donationController");
const { protect, authorize } = require("../middleware/auth");

// POST /api/donations - record a pledge (donor only)
router.post("/", protect, authorize("donor"), createDonation);

// GET /api/donations/my - get my donation history
router.get("/my", protect, authorize("donor"), getMyDonations);

module.exports = router;
