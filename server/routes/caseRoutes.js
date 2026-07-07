// ===================================================
// routes/caseRoutes.js - Case Routes
// ===================================================
const express = require("express");
const router = express.Router();
const {
  createCase,
  getVerifiedCases,
  getCaseById,
  getMyCases,
  getAllCasesAdmin,
  reviewCase,
  getStats,
} = require("../controllers/caseController");
const { protect, authorize } = require("../middleware/auth");
const { validateCase } = require("../middleware/validate");
const upload = require("../middleware/upload");

// Public routes
router.get("/", getVerifiedCases);                     // GET /api/cases - all verified
router.get("/:id", getCaseById);                       // GET /api/cases/:id - single case

// Protected - Beneficiary
router.post(
  "/",
  protect,
  authorize("beneficiary"),
  upload.array("proofDocuments", 5),   // up to 5 proof files
  validateCase,
  createCase
);
router.get("/my/cases", protect, authorize("beneficiary"), getMyCases);

// Protected - Admin
router.get("/admin/all", protect, authorize("admin"), getAllCasesAdmin);
router.get("/admin/stats", protect, authorize("admin"), getStats);
router.put("/admin/:id/review", protect, authorize("admin"), reviewCase);

module.exports = router;
