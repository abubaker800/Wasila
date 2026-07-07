// ===================================================
// seeder.js - Sample Data Seeder
// Run: node server/seeder.js
// ===================================================
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Case = require("./models/Case");
const Donation = require("./models/Donation");

connectDB().then(async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Case.deleteMany();
    await Donation.deleteMany();
    console.log("🗑️  Old data cleared.");

    // Create sample users
    const adminPass = await bcrypt.hash("admin123", 10);
    const userPass = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      name: "Wasila Admin",
      email: "admin@wasila.pk",
      password: "admin123", // will be hashed by pre-save hook
      role: "admin",
      city: "Multan",
    });

    const donor1 = await User.create({
      name: "Ahmed Khan",
      email: "ahmed@example.com",
      password: "password123",
      role: "donor",
      city: "Lahore",
      phone: "0300-1234567",
    });

    const donor2 = await User.create({
      name: "Sara Ali",
      email: "sara@example.com",
      password: "password123",
      role: "donor",
      city: "Karachi",
    });

    const bene1 = await User.create({
      name: "Muhammad Raza",
      email: "raza@example.com",
      password: "password123",
      role: "beneficiary",
      city: "Multan",
      phone: "0312-9876543",
    });

    const bene2 = await User.create({
      name: "Fatima Bibi",
      email: "fatima@example.com",
      password: "password123",
      role: "beneficiary",
      city: "Bahawalpur",
    });

    console.log("👤 Users created.");

    // Create sample cases
    const case1 = await Case.create({
      beneficiary: bene1._id,
      title: "Help with my daughter's annual school fees",
      description:
        "Assalam o Alaikum. I am a daily wage laborer in Multan. Due to recent illness and loss of work, I am unable to pay my daughter's annual school fees of Rs. 35,000. She is in Grade 8 and is a top student. I have attached the fee challan from her school. Please help keep her in school.",
      category: "Zakat",
      amountNeeded: 35000,
      amountRaised: 12000,
      status: "verified",
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      proofDocuments: [
        { filename: "school_fee_challan.pdf", path: "/uploads/sample_doc.pdf" },
        { filename: "school_id_card.jpg", path: "/uploads/sample_img.jpg" },
      ],
      paymentDetails: {
        method: "JazzCash",
        accountNumber: "0312-9876543",
        accountName: "Muhammad Raza",
      },
    });

    const case2 = await Case.create({
      beneficiary: bene2._id,
      title: "Urgent medical treatment for elderly mother",
      description:
        "My mother (age 72) has been diagnosed with a kidney condition that requires immediate treatment. The hospital estimate is Rs. 80,000. We are a family of 6 with very limited income. My father passed away last year. I have attached the hospital medical summary and prescription. Any help, large or small, will be a sadqa that benefits your hereafter.",
      category: "Sadqa",
      amountNeeded: 80000,
      amountRaised: 25000,
      status: "verified",
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      proofDocuments: [
        { filename: "hospital_report.pdf", path: "/uploads/sample_doc.pdf" },
      ],
      paymentDetails: {
        method: "EasyPaisa",
        accountNumber: "0301-7654321",
        accountName: "Fatima Bibi",
      },
    });

    const case3 = await Case.create({
      beneficiary: bene1._id,
      title: "Electricity disconnection — unpaid bill for 3 months",
      description:
        "Due to unemployment, I have been unable to pay my electricity bill for 3 months. The total outstanding amount is Rs. 18,500. WAPDA has disconnected the connection and my family is without power. I have 3 young children. I have attached all three bills. Please help restore electricity to my home.",
      category: "General Charity",
      amountNeeded: 18500,
      amountRaised: 0,
      status: "pending",
      proofDocuments: [
        { filename: "wapda_bill_jan.jpg", path: "/uploads/sample_img.jpg" },
        { filename: "wapda_bill_feb.jpg", path: "/uploads/sample_img.jpg" },
        { filename: "wapda_bill_mar.jpg", path: "/uploads/sample_img.jpg" },
      ],
      paymentDetails: {
        method: "Bank Account",
        accountNumber: "1234567890123456",
        accountName: "Muhammad Raza",
      },
    });

    console.log("📋 Cases created.");

    // Create sample donations
    await Donation.create({ donor: donor1._id, case: case1._id, amount: 7000, message: "May Allah bless your daughter's education. JazakAllah Khair." });
    await Donation.create({ donor: donor2._id, case: case1._id, amount: 5000, isAnonymous: true });
    await Donation.create({ donor: donor1._id, case: case2._id, amount: 15000, message: "Wishing your mother a quick recovery. إن شاء الله" });
    await Donation.create({ donor: donor2._id, case: case2._id, amount: 10000 });

    console.log("💚 Donations created.");

    console.log("\n✅ Seeding complete! Sample accounts:");
    console.log("   Admin:        admin@wasila.pk      / admin123");
    console.log("   Donor:        ahmed@example.com    / password123");
    console.log("   Donor:        sara@example.com     / password123");
    console.log("   Beneficiary:  raza@example.com     / password123");
    console.log("   Beneficiary:  fatima@example.com   / password123\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder error:", err);
    process.exit(1);
  }
});
