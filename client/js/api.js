// ===================================================
// js/api.js - API helper functions using Fetch
// ===================================================
const API_BASE = "/api";

const getToken = () => localStorage.getItem("wasila_token");

const headers = (auth = true) => {
  const h = { "Content-Type": "application/json" };
  if (auth) h["Authorization"] = `Bearer ${getToken()}`;
  return h;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

// ---- Auth ----
const authAPI = {
  // Step 1: Send OTP
  sendOTP: (body) =>
    fetch(`${API_BASE}/auth/send-otp`, { method: "POST", headers: headers(false), body: JSON.stringify(body) }).then(handleResponse),

  // Step 2: Verify OTP
  verifyOTP: (body) =>
    fetch(`${API_BASE}/auth/verify-otp`, { method: "POST", headers: headers(false), body: JSON.stringify(body) }).then(handleResponse),

  // Resend OTP
  resendOTP: (body) =>
    fetch(`${API_BASE}/auth/resend-otp`, { method: "POST", headers: headers(false), body: JSON.stringify(body) }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, { method: "POST", headers: headers(false), body: JSON.stringify(body) }).then(handleResponse),

  me: () =>
    fetch(`${API_BASE}/auth/me`, { headers: headers() }).then(handleResponse),
};

// ---- Cases ----
const casesAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/cases?${qs}`, { headers: headers(false) }).then(handleResponse);
  },
  getById: (id) =>
    fetch(`${API_BASE}/cases/${id}`, { headers: headers(false) }).then(handleResponse),
  getMyCases: () =>
    fetch(`${API_BASE}/cases/my/cases`, { headers: headers() }).then(handleResponse),
  create: (formData) =>
    fetch(`${API_BASE}/cases`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }).then(handleResponse),
  adminGetAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/cases/admin/all?${qs}`, { headers: headers() }).then(handleResponse);
  },
  adminReview: (id, body) =>
    fetch(`${API_BASE}/cases/admin/${id}/review`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  adminStats: () =>
    fetch(`${API_BASE}/cases/admin/stats`, { headers: headers() }).then(handleResponse),
};

// ---- Donations ----
const donationsAPI = {
  create: (body) =>
    fetch(`${API_BASE}/donations`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  getMyDonations: () =>
    fetch(`${API_BASE}/donations/my`, { headers: headers() }).then(handleResponse),
};

// ---- Auth State Helpers ----
const Auth = {
  save: (token, user) => {
    localStorage.setItem("wasila_token", token);
    localStorage.setItem("wasila_user", JSON.stringify(user));
  },
  user: () => {
    try { return JSON.parse(localStorage.getItem("wasila_user")); } catch { return null; }
  },
  isLoggedIn: () => !!localStorage.getItem("wasila_token"),
  logout: () => {
    localStorage.removeItem("wasila_token");
    localStorage.removeItem("wasila_user");
    window.location.href = "/";
  },
  requireAuth: (role = null) => {
    if (!Auth.isLoggedIn()) { window.location.href = "/pages/login.html"; return false; }
    if (role && Auth.user()?.role !== role) { alert("Access denied."); window.location.href = "/"; return false; }
    return true;
  },
};

// ---- Utility Functions ----
const Utils = {
  formatPKR: (n) => "Rs. " + Number(n).toLocaleString("en-PK"),
  timeAgo: (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  },
  progressPercent: (raised, needed) => Math.min(100, Math.round((raised / needed) * 100)),
  showAlert: (elId, msg, type = "danger") => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },
  clearAlert: (elId) => {
    const el = document.getElementById(elId);
    if (el) el.innerHTML = "";
  },
  setLoading: (btn, loading) => {
    if (!btn) return;
    if (loading) {
      btn.dataset.origText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner"></span> Loading...`;
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.origText || "Submit";
      btn.disabled = false;
    }
  },
  getBadgeHTML: (status) => {
    const map = { pending: "⏳ Pending", verified: "✅ Verified", rejected: "❌ Rejected", fulfilled: "🎉 Fulfilled" };
    return `<span class="badge badge-${status}">${map[status] || status}</span>`;
  },
};
