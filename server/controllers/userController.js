// ─── User Controller ──────────────────────────────────────────────────────────
// Admin manages users; users can update their own profile

const User = require("../models/User");

// ── GET /api/users — Admin: list all users ───────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// ── PUT /api/users/profile — Update own profile ──────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, city },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// ── PUT /api/users/:id/toggle — Admin: activate / deactivate account ─────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};
