// ===================================================
// js/navbar.js - Dynamic Navbar (injected into all pages)
// ===================================================

function renderNavbar() {
  const user = Auth.user();
  const isLoggedIn = Auth.isLoggedIn();

  // Determine dashboard link based on role
  let dashLink = "";
  if (isLoggedIn && user) {
    const dashHref =
      user.role === "admin" ? "/pages/admin-dashboard.html"
      : user.role === "beneficiary" ? "/pages/beneficiary-dashboard.html"
      : "/pages/donor-dashboard.html";
    dashLink = `<a href="${dashHref}" class="nav-link">Dashboard</a>`;
  }

  const navHTML = `
    <nav class="navbar">
      <div class="nav-inner">
        <a href="/" class="nav-brand">
          <span>وسیلہ</span> Wasila
        </a>
        <div class="nav-links" id="navLinks">
          <a href="/">Home</a>
          <a href="/pages/cases.html">Browse Cases</a>
          ${dashLink}
        </div>
        <div class="nav-user">
          ${isLoggedIn && user
            ? `<span class="nav-user-name">👤 ${user.name.split(" ")[0]}</span>
               <button class="btn btn-outline btn-sm" onclick="Auth.logout()">Logout</button>`
            : `<a href="/pages/login.html" class="btn btn-outline btn-sm" style="color:white;border-color:rgba(255,255,255,0.6)">Login</a>
               <a href="/pages/register.html" class="btn btn-gold btn-sm">Register</a>`
          }
        </div>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>`;

  // Inject navbar at the top of body
  document.body.insertAdjacentHTML("afterbegin", navHTML);

  // Hamburger toggle
  document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });
}

// Auto-run on page load
document.addEventListener("DOMContentLoaded", renderNavbar);
