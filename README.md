# Student Support Hub

A full-stack college support platform for:
- grievance submission and tracking,
- notes/material sharing,
- alumni directory access.

Built for the INFT department workflow with role-based experiences for students and teachers.

## Current Status

This README is aligned with the current codebase as of 31 March 2026.

## Tech Stack

### Backend
- Node.js + Express
- Firebase Firestore (via Firebase Admin SDK)
- JWT authentication
- Multer for multipart uploads
- Cloudinary for file storage (notes + grievance attachments)
- Nodemailer (Gmail SMTP) for OTP and grievance emails

### Frontend
- React + Vite
- React Router
- Axios
- Lucide icons
- Custom CSS (no Tailwind in this codebase)

## Roles and Access

- **Student**
  - Register + OTP verify
  - Submit grievances
  - Upload notes
  - Report notes uploaded by others
  - View alumni directory

- **Teacher**
  - Register + OTP verify
  - View/reply/update grievance status
  - Upload notes
  - Moderate reported notes (ignore report or delete reported note)

## Core Features

### 1) Authentication (OTP-enabled)
- College domain validation during registration (`COLLEGE_DOMAIN`)
- Password is stored (hashed), but frontend login currently uses OTP resend + OTP verify flow
- JWT issued after OTP verification
- Route guards in frontend and role checks in backend middleware

### 2) Grievance Management
- Students submit grievance with:
  - title, category, priority, description
  - optional file attachment
- Attachment uploads to Cloudinary
- A formatted grievance email is sent to authority email with optional attached file
- Email grievance format is **anonymous** (student identity removed from email body)
- Teachers can:
  - view all grievances
  - reply to grievance
  - update status (`Submitted`, `Under Review`, `Resolved`)

### 3) Notes and Moderation
- Students and teachers can upload notes/material files
- Notes are grouped and searchable on the frontend
- Teacher uploads are marked as official
- Students can report a note (except their own, and only once per note)
- Teachers see reported notes highlighted with warning and can:
  - **Ignore Report** (clear report state)
  - **Delete Reported Note** (remove from platform)

### 4) Alumni Directory
- Authenticated users can browse/search alumni
- Frontend route is currently student-only

### 5) Browser Tab Titles
- Route-based document title management is implemented in frontend routing
- Each major page has its own tab title

## Project Structure

```text
studentsupporthub/
├── backend/
│   ├── config/
│   │   ├── firebase.js
│   │   ├── firebase-credentials.json
│   │   └── google-credentials.json
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── grievances.js
│   │   ├── notes.js
│   │   └── alumni.js
│   ├── utils/
│   │   ├── cloudinary.js
│   │   ├── googleDrive.js
│   │   └── mailer.js
│   ├── add-mock-users.js
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── uploads/
├── package.json
└── .env
```

## Environment Setup

Create a root `.env` file (same level as `package.json`):

```env
# Server
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret

# Email (Gmail SMTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# College domain for email validation
COLLEGE_DOMAIN=vcet.edu.in

# Authority email for grievance notifications
AUTHORITY_EMAIL=studentsupporthubproject@gmail.com

# Google Drive (currently not used by active routes)
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Required local credential files
- `backend/config/firebase-credentials.json` (required)
- `backend/config/google-credentials.json` (present for utility, currently not used by active routes)

## Install and Run

### 1) Install dependencies

From project root:

```bash
npm install
```

Frontend deps are installed via root setup in this repo workflow, but you can also run:

```bash
npm install --prefix frontend
```

### 2) Start in development

```bash
npm run dev
```

This runs:
- backend (`node --watch backend/server.js`) on port `3000`
- frontend Vite dev server (default `5173`)

### 3) Other scripts

```bash
npm run server   # backend only
npm run client   # frontend only
npm run build    # frontend production build
```

## API Overview

### Auth (`/api/auth`)
- `POST /register` - register user (student/teacher), sends OTP
- `POST /verify-otp` - verify OTP, returns JWT + user
- `POST /resend-otp` - resend OTP to email
- `POST /login` - password-based login endpoint (exists in backend)
- `GET /me` - get current user from JWT
- `GET /mock-setup` - create demo users (testing utility endpoint)

### Grievances (`/api/grievances`)
- `POST /` - student submits grievance (+ optional attachment)
- `GET /` - student sees own grievances, teacher sees all
- `GET /:id` - grievance details (students only own; teacher any)
- `PUT /:id/reply` - teacher reply + optional status update
- `PUT /:id/status` - teacher status update

### Notes (`/api/notes`)
- `POST /` - upload note file
- `GET /` - list notes (supports query params: `type`, `search`, `sortBy`)
- `PATCH /:id/report` - student reports note
- `PATCH /:id/ignore-report` - teacher clears report state
- `DELETE /:id` - uploader can delete own note; teacher can delete reported note

### Alumni (`/api/alumni`)
- `GET /` - list alumni
- `GET /:id` - single alumni

## Frontend Routes

- `/` - Login
- `/register` - Register
- `/otp` - OTP verification
- `/dashboard` - role-based dashboard (student/teacher)
- `/grievances` - grievance list/form
- `/grievances/:id` - grievance details + teacher reply UI
- `/notes` - notes listing/upload/report/moderation
- `/alumni` - alumni directory (student-only route guard)

## Data Collections (Firestore)

### `users`
Stores user profile, auth fields, OTP verification state.

### `grievances`
Stores grievance content, attachment link, status, teacher reply metadata.

### `notes`
Stores note metadata + moderation fields:
- `isReported`
- `reportCount`
- `reportedBy`
- `ignoredAt`
- `ignoredBy`

### `alumni`
Stores alumni profile and contact/career info.

## Utility Scripts

From project root:

```bash
node backend/add-mock-users.js   # creates mock users and clears notes/grievances
node backend/seed.js             # seeds sample alumni data
```

## Troubleshooting

### Firebase initialization error
- Confirm `backend/config/firebase-credentials.json` exists and is valid.

### Cloudinary upload failures
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Email not sending
- Use Gmail App Password in `EMAIL_PASS` (not normal account password).
- Verify less-common provider blocks/alerts in Gmail account.

### Grievance email recipient
- Uses `AUTHORITY_EMAIL`, with fallback to `studentsupporthubproject@gmail.com`.

## Notes

- Root test utility files were removed from this repository and are no longer part of the workflow.
- `backend/utils/googleDrive.js` exists but is not used by current active API routes.

## License

ISC
