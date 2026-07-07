// ─── UI Utilities ─────────────────────────────────────────────────────────────

// ── Toast notifications ───────────────────────────────────────────────────────
function showToast(message, type = "success", duration = 3500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${icons[type] || "ℹ️"}</span>
    <span style="flex:1">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ── Loading state on a button ─────────────────────────────────────────────────
function setLoading(btn, loading, text = "Loading…") {
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = text;
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || "Submit";
  }
}

// ── Format currency in PKR ────────────────────────────────────────────────────
function formatPKR(amount) {
  return "PKR " + Number(amount).toLocaleString("en-PK");
}

// ── Relative time (e.g. "2 days ago") ────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PK");
}

// ── Category display label ────────────────────────────────────────────────────
function categoryLabel(cat) {
  const map = { zakat: "Zakat", sadqa: "Sadqa", ushr: "Ushr", fitrana: "Fitrana", general: "General" };
  return map[cat] || cat;
}

// ── Funding percent ───────────────────────────────────────────────────────────
function fundingPercent(raised, required) {
  if (!required || required === 0) return 0;
  return Math.min(100, Math.round((raised / required) * 100));
}

// ── Capitalize first letter ───────────────────────────────────────────────────
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// ── Build case card HTML ──────────────────────────────────────────────────────
function buildCaseCard(c) {
  const pct = fundingPercent(c.amountRaised, c.amountRequired);
  const initials = (c.beneficiary?.name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  return `
    <div class="case-card">
      <div class="case-card-header">
        <span class="category-badge">${categoryLabel(c.category)}</span>
        <h3>${escHtml(c.title)}</h3>
      </div>
      <div class="case-card-body">
        <p>${escHtml(c.description)}</p>
        <div class="beneficiary-info">
          <div class="avatar">${initials}</div>
          <span>${escHtml(c.beneficiary?.name || "Anonymous")}</span>
          ${c.beneficiary?.city ? `<span>· ${escHtml(c.beneficiary.city)}</span>` : ""}
          <span class="verified-badge" style="margin-left:auto">✓ Verified</span>
        </div>
      </div>
      <div class="case-card-footer">
        <div class="progress-wrap">
          <div class="progress-info">
            <span class="raised">${formatPKR(c.amountRaised)} raised</span>
            <span class="goal">of ${formatPKR(c.amountRequired)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <a href="pages/case-detail.html?id=${c._id}" class="btn btn-outline btn-sm" style="flex:1;text-align:center">View Details</a>
        </div>
      </div>
    </div>
  `;
}

// ── Escape HTML to prevent XSS ────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Redirect if not logged in ─────────────────────────────────────────────────
function requireAuth(role = null) {
  if (!isLoggedIn()) {
    window.location.href = "/pages/auth.html";
    return false;
  }
  const user = getCurrentUser();
  if (role && user.role !== role) {
    showToast("Access denied for your role", "error");
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

// ── Render navbar links based on auth state ───────────────────────────────────
function renderNavLinks() {
  const container = document.getElementById("nav-links");
  if (!container) return;

  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = `
      <li><a href="/index.html">Home</a></li>
      <li><a href="/pages/browse.html">Browse Cases</a></li>
      <li><a href="/pages/auth.html" class="btn-nav-cta">Login / Register</a></li>
    `;
    return;
  }

  let dashLink = "/pages/dashboard.html";

  container.innerHTML = `
    <li><a href="/index.html">Home</a></li>
    <li><a href="/pages/browse.html">Browse Cases</a></li>
    <li><a href="${dashLink}">Dashboard</a></li>
    <li><span style="color:rgba(255,255,255,0.55);font-size:0.85rem;padding:7px 8px">Hi, ${escHtml(user.name.split(" ")[0])}</span></li>
    <li><button onclick="logout()">Logout</button></li>
  `;
}

function logout() {
  clearSession();
  window.location.href = "/index.html";
}

// ── Init hamburger menu ───────────────────────────────────────────────────────
function initHamburger() {
  const btn = document.getElementById("hamburger");
  const links = document.getElementById("nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", () => links.classList.toggle("open"));
}
