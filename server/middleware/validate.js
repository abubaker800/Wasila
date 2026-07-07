// ===================================================
// middleware/validate.js - Full Input Validation
// All fields properly validated frontend + backend
// ===================================================

// Pakistani phone number regex: 03001234567 or +923001234567
const phoneRegex = /^((\+92|0)[0-9]{10})$/;
const emailRegex = /^\S+@\S+\.\S+$/;

// ---- Validate Send-OTP (Registration Step 1) ----
const validateSendOTP = (req, res, next) => {
  const { name, email, password, role, phone, city } = req.body;
  const errors = [];

  // Name
  if (!name || name.trim().length < 2)
    errors.push("Full name must be at least 2 characters.");
  if (name && name.trim().length > 50)
    errors.push("Name cannot exceed 50 characters.");

  // Email
  if (!email || !emailRegex.test(email.trim()))
    errors.push("Please provide a valid email address.");

  // Password
  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters.");
  if (password && password.length > 100)
    errors.push("Password is too long.");

  // Role
  const validRoles = ["beneficiary", "donor"];
  if (!role || !validRoles.includes(role))
    errors.push("Please select a valid role (Donor or Beneficiary).");

  // Phone — required
  if (!phone || phone.trim() === "")
    errors.push("Phone number is required.");
  else if (!phoneRegex.test(phone.trim()))
    errors.push("Please enter a valid Pakistani phone number (e.g. 03001234567).");

  // City — required
  if (!city || city.trim().length < 2)
    errors.push("City is required (at least 2 characters).");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

// ---- Validate Login ----
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !emailRegex.test(email.trim()))
    errors.push("Please provide a valid email address.");
  if (!password || password.trim() === "")
    errors.push("Password is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

// ---- Validate Case Creation ----
const validateCase = (req, res, next) => {
  const { title, description, category, amountNeeded, paymentMethod, accountNumber, accountName } = req.body;
  const errors = [];

  if (!title || title.trim().length < 5)
    errors.push("Case title must be at least 5 characters.");
  if (title && title.trim().length > 100)
    errors.push("Title cannot exceed 100 characters.");

  if (!description || description.trim().length < 20)
    errors.push("Description must be at least 20 characters.");

  const validCategories = ["Zakat", "Sadqa", "Ushr", "Fitrana", "General Charity"];
  if (!category || !validCategories.includes(category))
    errors.push("Please select a valid category.");

  if (!amountNeeded || isNaN(amountNeeded) || Number(amountNeeded) < 100)
    errors.push("Required amount must be at least Rs. 100.");
  if (amountNeeded && Number(amountNeeded) > 10000000)
    errors.push("Amount cannot exceed Rs. 1 crore.");

  const validMethods = ["Bank Account", "JazzCash", "EasyPaisa"];
  if (!paymentMethod || !validMethods.includes(paymentMethod))
    errors.push("Please select a valid payment method.");

  if (!accountNumber || accountNumber.trim().length < 5)
    errors.push("Account number must be at least 5 characters.");

  if (!accountName || accountName.trim().length < 2)
    errors.push("Account holder name is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

module.exports = { validateSendOTP, validateLogin, validateCase };
