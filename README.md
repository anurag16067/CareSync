CareSync — MERN Doctor Appointment Platform

CareSync is a full-stack web application that streamlines doctor appointment bookings with clear, role-based experiences for patients, doctors, and admins. Built on the MERN stack, it focuses on secure auth, smooth scheduling, and an intuitive UI.

Live Demo: care-sync-inky.vercel.app 
GitHub

✨ Features
Patient

Sign up / login, profile management

Browse doctors & specializations

Real-time slot availability & appointment booking

View, reschedule, or cancel appointments

Notifications/toasts for key actions

Doctor

Secure login & role-based dashboard

Manage availability & time slots

View upcoming / past appointments

Mark appointments as confirmed / completed / cancelled

Update profile & clinic details

Admin

Admin dashboard with system overview

Manage doctors (verify, activate/deactivate)

View platform-wide appointments

Basic user management

Folder layout seen in repo: admin/, backend/, frontend/, Testing_pic/. 
GitHub

🧱 Tech Stack

Frontend: React (SPA), React Router, Axios, Toast notifications, CSS utility framework (e.g., Tailwind/Bootstrap)

Backend: Node.js, Express.js, REST APIs, JWT auth, bcrypt

Database: MongoDB (Mongoose ODM)

Storage/Media (optional): Cloudinary + Multer (if using profile images)

Deploy: Vercel / Render / Railway / Netlify (as applicable)

The repo description confirms MERN + role-based access and the live Vercel link. 
GitHub

📂 Monorepo Structure
CareSync/
├─ admin/        # Admin portal (React app)
├─ frontend/     # Patient/Doctor app (React app)
├─ backend/      # Express API + MongoDB
└─ Testing_pic/  # Screenshots/assets for README or testing

⚙️ Environment Variables

Create .env files as shown below (adjust to your actual names if different):

Backend (backend/.env)
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173        # frontend dev URL
ADMIN_URL=http://localhost:5174         # admin dev URL
CLOUDINARY_CLOUD_NAME=your_cloud_name   # optional
CLOUDINARY_API_KEY=your_api_key         # optional
CLOUDINARY_API_SECRET=your_api_secret   # optional

Frontend (frontend/.env)
VITE_API_BASE_URL=http://localhost:5000

Admin (admin/.env)
VITE_API_BASE_URL=http://localhost:5000


If you don’t use Cloudinary or split client/admin ports, remove those keys.

🚀 Local Development
1) Clone
git clone https://github.com/anurag16067/CareSync.git
cd CareSync

2) Install dependencies
# backend
cd backend
npm install
# or: pnpm i / yarn

# frontend
cd ../frontend
npm install

# admin
cd ../admin
npm install

3) Run development servers

Open three terminals, one per app:

# Terminal 1 - backend
cd backend
npm run dev    # nodemon or equivalent

# Terminal 2 - frontend
cd frontend
npm run dev    # likely runs on http://localhost:5173

# Terminal 3 - admin
cd admin
npm run dev    # likely runs on http://localhost:5174


Adjust ports/commands if your package.json scripts differ.

🗺️ API Overview (Typical Endpoints)

Names may differ—align with your actual routes.

Auth

POST /api/auth/register — create account

POST /api/auth/login — login, returns JWT

GET /api/auth/me — get current user (auth)

Doctors

GET /api/doctors — list doctors

GET /api/doctors/:id — doctor profile

POST /api/doctors — (admin) add/verify doctor

PATCH /api/doctors/:id/status — (admin) activate/deactivate

Appointments

POST /api/appointments — create booking

GET /api/appointments/my — user’s appointments

PATCH /api/appointments/:id — update status (doctor/admin)

DELETE /api/appointments/:id — cancel

Slots/Availability

GET /api/availability?doctorId=&date= — fetch slots

POST /api/availability — (doctor) manage schedule

🔐 Authentication & Security

JWT for stateless auth; tokens stored securely on client

bcrypt for password hashing

Route guards/middleware for role-based access (patient/doctor/admin)

Basic input validation and centralized error handling

🧪 Testing (optional)

Unit tests: Jest / Vitest

API tests: Supertest / Postman collection

Lint & type checks: ESLint, TypeScript (if enabled)

📦 Scripts (examples)

Adjust to your package.json:

backend/package.json

{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}


frontend/package.json and admin/package.json

{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

🖼️ Screenshots

Add images from Testing_pic/ here for quick visual context:

/Testing_pic
  ├─ dashboard.png
  ├─ booking-flow.png
  └─ admin-panel.png
