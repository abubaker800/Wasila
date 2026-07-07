// ===================================================
// routes/authRoutes.js
// ===================================================
const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP, resendOTP, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validateSendOTP, validateLogin } = require("../middleware/validate");

router.post("/send-otp", validateSendOTP, sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);

module.exports = router;
