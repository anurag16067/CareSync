# CareSync: Doctor Appointment Platform with AI Symptom Checker

CareSync is a full-stack MERN application for booking doctor appointments. It has three role-based experiences, for **patients**, **doctors** and **admins**, plus an **AI Symptom Checker** powered by Google Gemini. Patients describe how they feel, and it recommends the right specialist.

**Live demo:** [care-sync-inky.vercel.app](https://care-sync-inky.vercel.app)

---

## ✨ Features

### 🤖 AI Symptom Checker (new)
- Patients describe their symptoms in plain language. The AI recommends **one of the platform's specialities**, with an urgency level (low / moderate / high), a short reason, an alternative speciality and safe self-care tips.
- Matching doctors are shown right below the result, with available doctors first and one-click booking.
- **Emergency detection:** red-flag symptoms (chest pain, breathing difficulty, stroke signs, etc.) show a "Seek emergency care now, call 112" banner instead of doctor cards.
- Symptoms are **carried into the booking** and saved on the appointment, so the **doctor sees them** in their panel.
- Personalised with the patient's age and gender from their profile.
- Built-in safeguards:
  - The AI's answer is restricted to a fixed list of specialities and checked again on the server.
  - The AI never diagnoses or names medicines.
  - Input that isn't about health symptoms is rejected.
  - Requests are rate-limited per user.
  - If Google's servers are busy, the backend retries automatically and then switches to a backup model.
- Available from the **AI CHECKER** navbar link and the "Not sure which doctor to see?" box on the home page. You must be logged in to use it.

### 🧑 Patient (frontend)
- Sign up, log in, and edit your profile (photo, address, gender, date of birth, phone)
- Browse doctors and filter by speciality
- Book appointments in 30-minute slots over the next 7 days, with an optional symptoms note for the doctor
- View and cancel appointments
- Pay online with **Razorpay**

### 🩺 Doctor (admin panel)
- Secure login and dashboard (earnings, appointments, patients, latest bookings)
- View appointments with patient details, age and **reported symptoms**
- Mark appointments as completed or cancelled
- Update profile (fees, address, availability, about)

### 🛠️ Admin (admin panel)
- Dashboard with platform overview
- Add doctors (image upload via Cloudinary)
- View all doctors and toggle availability
- View and cancel any appointment

**Specialities:** General physician · Gynecologist · Dermatologist · Pediatricians · Neurologist · Gastroenterologist

---

## 🧱 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend (patient) | React 18, Vite, React Router 7, Tailwind CSS, Axios, React Toastify |
| Admin / Doctor panel | React 18, Vite, React Router 7, Tailwind CSS 4, Axios, React Toastify |
| Backend | Node.js, Express 4, JWT, bcrypt, validator, Multer |
| Database | MongoDB Atlas + Mongoose 8 |
| AI | Google Gemini API (`@google/genai`), `express-rate-limit` |
| Media / Payments | Cloudinary, Razorpay |
| Hosting | Vercel (frontend + admin), Render (backend) |

---

## 📂 Project Structure

```
CareSync/
├─ backend/                 # Express REST API
│  ├─ config/               # MongoDB + Cloudinary setup
│  ├─ controllers/          # admin, doctor, user, ai (symptom checker)
│  ├─ middlewares/          # authAdmin, authDoctor, authUser, multer, aiLimiter
│  ├─ models/               # user, doctor, appointment
│  ├─ routes/               # /api/admin, /api/doctor, /api/user
│  └─ server.js
├─ frontend/                # Patient web app (React + Vite)
│  └─ src/
│     ├─ pages/             # Home, Doctors, Appointment, SymptomChecker, MyAppointments, ...
│     ├─ components/        # Navbar, Header, SymptomTeaser, TopDoctors, ...
│     └─ context/AppContext.jsx
├─ admin/                   # Admin + Doctor panel (React + Vite)
│  └─ src/
│     ├─ pages/Admin/       # Dashboard, AddDoctor, DoctorList, AllApointments
│     ├─ pages/Doctor/      # DoctorDashboard, DoctorAppointmnets, DoctorProfile
│     └─ context/
└─ Testing_pic/             # API testing screenshots
```

---

## ⚙️ Environment Variables

Create a `.env` file in each app folder. These files are gitignored, so **never commit them**.

### `backend/.env`
```env
PORT=4000

# MongoDB Atlas connection string (the database name "CareSync" is set in code)
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net

# Auth
JWT_SECRET=any_long_random_string
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Cloudinary (doctor / profile image uploads)
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_API=

# Razorpay (online payments); the server will not start without these
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CURRENCY=INR

# Google Gemini (AI Symptom Checker); free key at https://aistudio.google.com
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.8-flash

# Optional: only if MongoDB fails with "querySrv ECONNREFUSED" on your machine
# DNS_SERVERS=8.8.8.8,1.1.1.1
```

### `frontend/.env`
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=
```

### `admin/.env`
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+, a MongoDB Atlas cluster, and Cloudinary, Razorpay (test mode) and Gemini API keys.

```bash
# 1. Clone
git clone https://github.com/anurag16067/CareSync.git
cd CareSync

# 2. Install dependencies
cd backend  && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

Run each app in its own terminal:

| App | Command | URL |
|---|---|---|
| Backend | `cd backend && npm run server` (or `npm start`) | http://localhost:4000 |
| Patient frontend | `cd frontend && npm run dev` | http://localhost:5173 |
| Admin / Doctor panel | `cd admin && npm run dev` | http://localhost:5174 |

The backend should print `Database connected` and `Server Started 4000`.

### First-time setup
1. Log into the **admin panel** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and **add doctors**. The AI checker can only recommend doctors that exist.
2. On the **patient site**, create an account (password of at least 8 characters) and try **AI CHECKER**.
3. Book a doctor from the AI result, then log into the admin panel **as that doctor** to see the patient's symptoms on the appointment.

---

## 🗺️ API Reference

Base URL: `http://localhost:4000`. Protected routes need a token. Patients send a `token` header, doctors send a `dtoken` header, and admins send `Authorization: Bearer <token>`.

### User: `/api/user`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Create patient account |
| POST | `/login` | – | Log in, returns JWT |
| GET | `/get-profile` | user | Get profile |
| POST | `/update-profile` | user | Update profile (multipart, optional image) |
| POST | `/book-appointment` | user | Book slot `{ docId, slotDate, slotTime, symptoms? }` |
| GET | `/appointments` | user | List my appointments |
| POST | `/cancel-appointment` | user | Cancel appointment |
| POST | `/payment-razorpay` | user | Create Razorpay order |
| POST | `/verifyRazorpay` | user | Verify payment |
| POST | `/ai/symptom-check` | user | **AI specialist recommendation** `{ symptoms, duration? }` |

Example AI response:
```json
{
  "success": true,
  "result": {
    "speciality": "Pediatricians",
    "alternative": "General physician",
    "urgency": "moderate",
    "emergency": false,
    "reason": "Since the patient is a 4-year-old child, a pediatrician is the best choice...",
    "tips": ["Keep your child well hydrated", "Ensure plenty of rest", "Monitor temperature regularly"]
  }
}
```

### Doctor: `/api/doctor`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/list` | – | Public doctor list |
| POST | `/login` | – | Doctor login |
| GET | `/appointments` | doctor | Doctor's appointments |
| POST | `/complete-appointment` | doctor | Mark completed |
| POST | `/cancel-appointment` | doctor | Cancel |
| GET | `/dashboard` | doctor | Dashboard stats |
| GET | `/profile` | doctor | Get profile |
| POST | `/update-profile` | doctor | Update fees / address / availability |

### Admin: `/api/admin`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/login` | – | Admin login |
| POST | `/add-doctor` | admin | Add doctor (multipart with image) |
| POST | `/all-doctors` | admin | List all doctors |
| POST | `/change-availability` | admin | Toggle doctor availability |
| GET | `/appointments` | admin | All appointments |
| POST | `/cancel-appointment` | admin | Cancel any appointment |
| GET | `/dashboard` | admin | Platform stats |

---

## 🔐 Security
- Passwords hashed with **bcrypt**; stateless **JWT** auth with separate middleware per role
- The Gemini API key lives **only on the backend** and is never exposed to the browser
- AI endpoint protected by login + rate limiting (10 requests / 15 min per user)
- AI output is validated server-side against a whitelist before reaching the client

> ⚠️ The AI Symptom Checker provides guidance only and is **not a medical diagnosis**. In an emergency, contact local emergency services.

---

## ☁️ Deployment

| App | Platform | Notes |
|---|---|---|
| Backend | Render | Start command `npm start`. Add every `backend/.env` variable (except `DNS_SERVERS`) under **Environment**. |
| Frontend | Vercel | Root directory `frontend`, env `VITE_BACKEND_URL=<your Render URL>`, `VITE_RAZORPAY_KEY_ID` |
| Admin | Vercel | Root directory `admin`, env `VITE_BACKEND_URL=<your Render URL>` |

Pushing to `main` redeploys automatically if auto-deploy is enabled.

---

## 🧪 API Testing Screenshots

| Admin: list all doctors (Postman) | User: register validation (Thunder Client) |
|---|---|
| ![All doctors API](Testing_pic/Screenshot%202025-03-15%20101525.png) | ![Register validation](Testing_pic/Screenshot%202025-03-16%20021435.png) |

| User: get profile with JWT (Thunder Client) |
|---|
| ![Get profile API](Testing_pic/Screenshot%202025-03-21%20014719.png) |

---

## 👤 Author

**Anurag Kumar** · [GitHub @anurag16067](https://github.com/anurag16067)
