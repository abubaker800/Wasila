// ─── User Routes ─────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const { getAllUsers, updateProfile, toggleUserStatus } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

// @route  GET /api/users  (admin only)
router.get("/", protect, authorize("admin"), getAllUsers);

// @route  PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// @route  PUT /api/users/:id/toggle  (admin only)
router.put("/:id/toggle", protect, authorize("admin"), toggleUserStatus);

module.exports = router;
