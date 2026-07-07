// ===================================================
// controllers/authController.js
// OTP registration flow + ban check on login
// ===================================================
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../config/mailer");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc    Step 1 — Validate input & send OTP
// @route   POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { name, email, password, role, phone, city } = req.body;

    // Check email not already registered
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "This email is already registered. Please login." });
    }

    // Check phone not already registered
    const phoneExists = await User.findOne({ phone: phone.trim() });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: "This phone number is already registered." });
    }

    // Check if email or phone is banned
    const bannedByEmail = await User.findOne({ email: email.toLowerCase().trim(), isBanned: true });
    const bannedByPhone = await User.findOne({ phone: phone.trim(), isBanned: true });
    if (bannedByEmail || bannedByPhone) {
      return res.status(403).json({
        success: false,
        message: "This account has been restricted due to multiple fraudulent case submissions. Contact support.",
      });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email: email.toLowerCase().trim() });
    await OTP.create({
      email: email.toLowerCase().trim(),
      otp,
      userData: { name: name.trim(), password, role: role || "donor", phone: phone.trim(), city: city.trim() },
    });

    await sendOTPEmail(email, otp, name);

    res.json({ success: true, message: `Verification code sent to ${email}. Check your inbox.` });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP. Please check your Gmail settings in .env file." });
  }
};

// @desc    Step 2 — Verify OTP and create account
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required." });

    const otpRecord = await OTP.findOne({ email: email.toLowerCase().trim() });

    if (!otpRecord)
      return res.status(400).json({ success: false, message: "OTP expired or not found. Please register again." });

    if (otpRecord.otp !== otp.trim())
      return res.status(400).json({ success: false, message: "Incorrect OTP. Please try again." });

    const { name, password, role, phone, city } = otpRecord.userData;

    const user = await User.create({ name, email: email.toLowerCase().trim(), password, role, phone, city, isVerified: true });
    await OTP.deleteMany({ email: email.toLowerCase().trim() });

    res.status(201).json({
      success: true,
      message: "Email verified! Account created successfully.",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ success: false, message: `This ${field} is already registered.` });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otpRecord = await OTP.findOne({ email: email?.toLowerCase().trim() });
    if (!otpRecord)
      return res.status(400).json({ success: false, message: "Session expired. Please register again." });

    const otp = generateOTP();
    otpRecord.otp = otp;
    otpRecord.createdAt = new Date();
    await otpRecord.save();

    await sendOTPEmail(email, otp, otpRecord.userData.name);
    res.json({ success: true, message: "New OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to resend OTP." });
  }
};

// @desc    Login — checks ban by email AND phone
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Your account has been restricted. Reason: ${user.banReason || "3 consecutive case rejections due to fraudulent submissions."}. Contact support if you believe this is a mistake.`,
      });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated. Contact support." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    res.json({
      success: true,
      message: "Login successful!",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { sendOTP, verifyOTP, resendOTP, login, getMe };
