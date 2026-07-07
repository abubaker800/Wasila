// ─── Database Seeder ──────────────────────────────────────────────────────────
// Run: node server/seed.js
// Creates 1 admin, 2 beneficiaries, 2 donors, and 4 sample cases.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Case = require("./models/Case");
const Donation = require("./models/Donation");

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Case.deleteMany();
  await Donation.deleteMany();
  console.log("🗑️  Cleared existing data");

  // ── Users ─────────────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);

  const admin = await User.create({
    name: "Admin Wasila",
    email: "admin@wasila.pk",
    password: "admin123",
    role: "admin",
    phone: "03001234567",
    city: "Lahore",
  });

  const ben1 = await User.create({
    name: "Fatima Bibi",
    email: "fatima@example.com",
    password: "password123",
    role: "beneficiary",
    phone: "03112345678",
    city: "Multan",
  });

  const ben2 = await User.create({
    name: "Ahmed Raza",
    email: "ahmed@example.com",
    password: "password123",
    role: "beneficiary",
    phone: "03219876543",
    city: "Karachi",
  });

  const donor1 = await User.create({
    name: "Hassan Malik",
    email: "hassan@example.com",
    password: "password123",
    role: "donor",
    phone: "03331234567",
    city: "Islamabad",
  });

  const donor2 = await User.create({
    name: "Zainab Noor",
    email: "zainab@example.com",
    password: "password123",
    role: "donor",
    city: "Lahore",
  });

  console.log("✅ Users created");

  // ── Cases ─────────────────────────────────────────────────────────────────
  const case1 = await Case.create({
    beneficiary: ben1._id,
    title: "Help with children's school fees",
    description:
      "I am a widow with three school-going children. My husband passed away six months ago and I am struggling to pay their school fees. My eldest daughter is appearing in her Matric exams and I cannot bear to pull her out of school now.",
    category: "zakat",
    amountRequired: 25000,
    amountRaised: 12000,
    paymentInfo: { method: "jazzcash", accountTitle: "Fatima Bibi", accountNumber: "03112345678" },
    status: "approved",
    reviewedBy: admin._id,
    reviewedAt: new Date(),
    proofDocuments: [],
  });

  const case2 = await Case.create({
    beneficiary: ben2._id,
    title: "Unpaid electricity bill — disconnection notice",
    description:
      "I lost my job three months ago due to factory closure. My family has received a final disconnection notice for our electricity. We have a disabled child at home who requires medical equipment that needs constant power. Please help us avoid disconnection.",
    category: "sadqa",
    amountRequired: 8500,
    amountRaised: 3000,
    paymentInfo: { method: "easypaisa", accountTitle: "Ahmed Raza", accountNumber: "03219876543" },
    status: "approved",
    reviewedBy: admin._id,
    reviewedAt: new Date(),
    proofDocuments: [],
  });

  const case3 = await Case.create({
    beneficiary: ben1._id,
    title: "Medical bills for mother's surgery",
    description:
      "My mother needs a heart bypass surgery. The hospital has quoted PKR 180,000. We have gathered most of it from family but are short by PKR 45,000. Any support will be deeply appreciated.",
    category: "general",
    amountRequired: 45000,
    amountRaised: 0,
    paymentInfo: { method: "bank", accountTitle: "Fatima Bibi", accountNumber: "1234-5678-9012" },
    status: "pending",
    proofDocuments: [],
  });

  const case4 = await Case.create({
    beneficiary: ben2._id,
    title: "Fitrana distribution for family of six",
    description:
      "Our family of six (two elderly parents, two adults, two children) is eligible for Fitrana this Eid. We are small farmers who had crop failure this year due to flooding.",
    category: "fitrana",
    amountRequired: 6000,
    amountRaised: 6000,
    paymentInfo: { method: "jazzcash", accountTitle: "Ahmed Raza", accountNumber: "03219876543" },
    status: "approved",
    reviewedBy: admin._id,
    reviewedAt: new Date(),
    proofDocuments: [],
  });

  console.log("✅ Cases created");

  // ── Donations ─────────────────────────────────────────────────────────────
  await Donation.create({
    donor: donor1._id,
    case: case1._id,
    amount: 7000,
    transferConfirmed: true,
    message: "May Allah bless your children with success.",
    transferMethod: "jazzcash",
  });

  await Donation.create({
    donor: donor2._id,
    case: case1._id,
    amount: 5000,
    transferConfirmed: true,
    message: "Best wishes to your family.",
    transferMethod: "bank",
  });

  await Donation.create({
    donor: donor1._id,
    case: case2._id,
    amount: 3000,
    transferConfirmed: true,
    transferMethod: "easypaisa",
  });

  console.log("✅ Donations created");

  console.log("\n─────────────────────────────────────────────");
  console.log("🌱 Seed complete! Login credentials:");
  console.log("  Admin    → admin@wasila.pk    / admin123");
  console.log("  Donor    → hassan@example.com / password123");
  console.log("  Benef.   → fatima@example.com / password123");
  console.log("─────────────────────────────────────────────\n");

  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
