// ===================================================
// config/mailer.js - All Email Templates
// OTP | Rejection (with warning) | Approval | Ban
// ===================================================
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

// ---- OTP Email ----
const sendOTPEmail = async (toEmail, otp, name) => {
  await transporter.sendMail({
    from: `"Wasila وسیلہ" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your Wasila Verification Code",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#f4f9f6;padding:30px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#1a6b3c;margin:0;">وسیلہ Wasila</h1>
          <p style="color:#6b7280;margin:4px 0 0;">A Digital Bridge for Zakat & Sadqa</p>
        </div>
        <div style="background:white;border-radius:10px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <p style="color:#374151;font-size:16px;">Assalam o Alaikum <strong>${name}</strong>,</p>
          <p style="color:#374151;">Your email verification code is:</p>
          <div style="text-align:center;margin:28px 0;">
            <span style="font-size:44px;font-weight:900;letter-spacing:14px;color:#1a6b3c;background:#f0fdf6;padding:16px 28px;border-radius:10px;border:2px dashed #27a35a;">${otp}</span>
          </div>
          <p style="color:#6b7280;font-size:14px;text-align:center;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">© 2026 Wasila — Air University Multan</p>
      </div>`,
  });
};

// ---- Rejection Email (with warning counter) ----
const sendRejectionEmail = async (toEmail, name, caseTitle, reason, rejectionCount, remaining) => {
  const warningColor = rejectionCount >= 2 ? "#dc2626" : "#d97706";
  const warningBg = rejectionCount >= 2 ? "#fee2e2" : "#fef3c7";
  const warningText = rejectionCount >= 2
    ? `⚠️ FINAL WARNING: This is your ${rejectionCount}rd rejection. One more rejection will permanently restrict your account.`
    : `⚠️ Warning: This is your ${rejectionCount}${rejectionCount === 1 ? "st" : "nd"} rejection. You have ${remaining} attempt(s) remaining before account restriction.`;

  await transporter.sendMail({
    from: `"Wasila وسیلہ" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `❌ Case Update — Wasila (${rejectionCount}/3 rejections)`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#f4f9f6;padding:30px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#1a6b3c;margin:0;">وسیلہ Wasila</h1>
        </div>
        <div style="background:white;border-radius:10px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <p style="color:#374151;font-size:16px;">Assalam o Alaikum <strong>${name}</strong>,</p>
          <p>Your case could not be approved at this time.</p>
          <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:6px;padding:16px;margin:20px 0;">
            <p style="margin:0 0 6px;font-weight:700;">📋 Case: ${caseTitle}</p>
            <p style="margin:0 0 4px;"><strong>Status:</strong> <span style="color:#dc2626;">Rejected</span></p>
            <p style="margin:8px 0 4px;"><strong>Reason:</strong></p>
            <p style="margin:4px 0 0;background:#fee2e2;padding:10px;border-radius:6px;">${reason}</p>
          </div>
          <div style="background:${warningBg};border:1px solid ${warningColor};border-radius:8px;padding:14px;margin:16px 0;">
            <p style="margin:0;color:${warningColor};font-weight:700;font-size:0.9rem;">${warningText}</p>
          </div>
          <p style="color:#374151;">Please resubmit with valid, clear documents.</p>
          <div style="text-align:center;margin-top:20px;">
            <a href="http://localhost:5000/pages/beneficiary-dashboard.html" style="background:#1a6b3c;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Submit New Case</a>
          </div>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">© 2026 Wasila — Air University Multan</p>
      </div>`,
  });
};

// ---- Ban Email ----
const sendBanEmail = async (toEmail, name, reason) => {
  await transporter.sendMail({
    from: `"Wasila وسیلہ" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "🚫 Account Restricted — Wasila",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#f4f9f6;padding:30px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#1a6b3c;margin:0;">وسیلہ Wasila</h1>
        </div>
        <div style="background:white;border-radius:10px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <p style="color:#374151;font-size:16px;">Assalam o Alaikum <strong>${name}</strong>,</p>
          <div style="background:#fee2e2;border:2px solid #dc2626;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
            <p style="font-size:2rem;margin:0;">🚫</p>
            <h2 style="color:#dc2626;margin:8px 0;">Account Permanently Restricted</h2>
            <p style="color:#374151;margin:0;">Your account has been restricted after 3 consecutive case rejections.</p>
          </div>
          <p><strong>Reason:</strong> ${reason}</p>
          <p style="color:#374151;">You will no longer be able to login or submit new cases using this email or phone number.</p>
          <p style="color:#6b7280;font-size:0.88rem;">If you believe this is a mistake, contact our support team with valid documentation.</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">© 2026 Wasila — Air University Multan</p>
      </div>`,
  });
};

// ---- Approval Email ----
const sendApprovalEmail = async (toEmail, name, caseTitle) => {
  await transporter.sendMail({
    from: `"Wasila وسیلہ" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "✅ Your Case Has Been Verified — Wasila",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#f4f9f6;padding:30px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#1a6b3c;margin:0;">وسیلہ Wasila</h1>
        </div>
        <div style="background:white;border-radius:10px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <p style="color:#374151;font-size:16px;">Assalam o Alaikum <strong>${name}</strong>,</p>
          <p>Great news! Your case has been <strong style="color:#16a34a;">verified</strong> by our admin team.</p>
          <div style="background:#dcfce7;border-left:4px solid #16a34a;border-radius:6px;padding:16px;margin:20px 0;">
            <p style="margin:0;font-weight:700;">✅ ${caseTitle}</p>
            <p style="margin:6px 0 0;color:#16a34a;font-weight:600;">Your case is now live! Donors can see and donate.</p>
          </div>
          <div style="text-align:center;margin-top:20px;">
            <a href="http://localhost:5000/pages/cases.html" style="background:#1a6b3c;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;">View Live Cases</a>
          </div>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">© 2026 Wasila — Air University Multan</p>
      </div>`,
  });
};

module.exports = { sendOTPEmail, sendRejectionEmail, sendApprovalEmail, sendBanEmail };
