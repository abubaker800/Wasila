# وسیلہ Wasila — A Digital Bridge for Zakat & Sadqa

A full-stack web application connecting deserving individuals with compassionate donors for Zakat, Sadqa, and social support. Built with **Node.js, Express, MongoDB, and vanilla HTML/CSS/JS**.

---

## 📁 Project Structure

```
wasila/
├── client/                   # Frontend (served as static files)
│   ├── index.html            # Home page
│   ├── css/
│   │   └── style.css         # Global styles
│   ├── js/
│   │   ├── api.js            # API helper functions + Auth utilities
│   │   └── navbar.js         # Dynamic navbar (injected into all pages)
│   └── pages/
│       ├── login.html        # Login page
│       ├── register.html     # Registration page
│       ├── cases.html        # Public browse cases page
│       ├── case-detail.html  # Single case + donation modal
│       ├── beneficiary-dashboard.html
│       ├── donor-dashboard.html
│       └── admin-dashboard.html
│
├── server/                   # Backend (Node.js + Express)
│   ├── index.js              # Entry point
│   ├── seeder.js             # Sample data seeder
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/               # Mongoose schemas (MVC: Model)
│   │   ├── User.js
│   │   ├── Case.js
│   │   └── Donation.js
│   ├── controllers/          # Business logic (MVC: Controller)
│   │   ├── authController.js
│   │   ├── caseController.js
│   │   └── donationController.js
│   ├── routes/               # Express routers (MVC: View-facing)
│   │   ├── authRoutes.js
│   │   ├── caseRoutes.js
│   │   └── donationRoutes.js
│   ├── middleware/
│   │   ├── auth.js           # JWT protect + authorize (RBAC)
│   │   ├── upload.js         # Multer file upload
│   │   └── validate.js       # Input validation
│   └── uploads/              # Uploaded proof documents stored here
│
├── .env.example              # Environment variable template
├── package.json
└── README.md
```

---

## 🚀 Setup & Run Instructions

### Prerequisites
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** running locally (v6+) → https://www.mongodb.com/try/download/community
- **Git** (optional)

---

### Step 1: Clone / Download the project

```bash
# If using git:
git clone <your-repo-url>
cd wasila

# Or just navigate into the project folder:
cd wasila
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up environment variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and fill in your values:
```
MONGO_URI=mongodb://localhost:27017/wasila
JWT_SECRET=your_super_secret_key_here_make_it_long
PORT=5000
NODE_ENV=development
```

### Step 4: Make sure MongoDB is running

```bash
# On Windows (if installed as a service):
# MongoDB should start automatically.

# On macOS (with Homebrew):
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

### Step 5: (Optional but recommended) Seed sample data

```bash
node server/seeder.js
```

This creates sample users, cases, and donations so you can test immediately.

**Sample accounts after seeding:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wasila.pk | admin123 |
| Donor | ahmed@example.com | password123 |
| Donor | sara@example.com | password123 |
| Beneficiary | raza@example.com | password123 |
| Beneficiary | fatima@example.com | password123 |

### Step 6: Start the server

```bash
# Production:
npm start

# Development (with auto-reload):
npm run dev
```

### Step 7: Open in browser

```
http://localhost:5000
```

---

## 🔑 Features

| Feature | Details |
|---------|---------|
| Authentication | JWT-based login/register with bcrypt password hashing |
| Role-based Access | 3 roles: `beneficiary`, `donor`, `admin` |
| Case Posting | Beneficiaries post cases with proof document uploads |
| Admin Verification | Admin reviews docs and approves/rejects cases |
| Donor Pledging | Donors record donation pledges; transfer is direct |
| Progress Tracking | Progress bar shows % of goal reached |
| Search & Filter | Filter cases by category or search by title |
| Responsive UI | Works on mobile and desktop |

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

### Cases
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/cases` | Public |
| GET | `/api/cases/:id` | Public |
| POST | `/api/cases` | Beneficiary |
| GET | `/api/cases/my/cases` | Beneficiary |
| GET | `/api/cases/admin/all` | Admin |
| GET | `/api/cases/admin/stats` | Admin |
| PUT | `/api/cases/admin/:id/review` | Admin |

### Donations
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/donations` | Donor |
| GET | `/api/donations/my` | Donor |

---

## 👨‍💻 Built By

Air University Multan — BS Computer Science
Roll No. 243513, 243607, 243543, 243785, 243613
