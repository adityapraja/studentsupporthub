# Student Support Hub

A comprehensive college platform for managing grievances, sharing notes, and connecting with alumni.

## Overview

**Student Support Hub** is a full-stack web application designed to streamline communication and resource sharing within a college community. It provides students, teachers, and alumni with dedicated features for submitting grievances, sharing educational materials, and maintaining professional connections.

## Features

### 🎓 Core Features

#### **1. Authentication & Authorization**
- Email-based user registration and login
- OTP verification for secure access
- Role-based access control (Student, Teacher, Admin, Alumni)
- JWT token-based authentication
- Secure password hashing with bcryptjs

#### **2. Grievance Management System**
- Submit grievances with detailed descriptions and attachments
- Attach files to grievance submissions (stored on Google Drive)
- Track grievance status (Submitted, In Progress, Resolved, Closed)
- Priority levels (Low, Medium, High)
- Teacher/Admin replies to grievances
- Email notifications for new grievances
- Categorized grievance tracking

#### **3. Notes & Study Materials**
- Upload and share educational notes
- Support for subject-specific organization
- Semester and branch classification
- Tag-based organization and search
- Automatic file hosting on Google Drive
- Distinguish between student and official (teacher) notes
- File management and versioning

#### **4. Alumni Network**
- Comprehensive alumni directory
- Search alumni by name, position, or area of expertise
- Alumni profile information (batch year, current position, description)
- Networking and mentorship connections
- Professional contact information

#### **5. File Management**
- Secure file uploads with multer
- Integration with Google Drive for reliable file storage
- Automatic file cleanup and management
- Support for various file types

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5.2.1
- **Database:** Firebase Firestore
- **Authentication:** Firebase Admin SDK, JWT
- **File Storage:** Google Drive API
- **Email Service:** Nodemailer
- **Security:** bcryptjs, CORS

### Frontend
- **Framework:** React 19.2.4
- **Build Tool:** Vite
- **Routing:** React Router DOM v7.13.1
- **HTTP Client:** Axios
- **Styling:** CSS3
- **Icons:** Lucide React
- **Linting:** ESLint

### Infrastructure
- **Authentication Provider:** Firebase
- **File Storage:** Google Drive
- **Email Provider:** Nodemailer (supports SMTP)

## Project Structure

```
studentsupporthub/
├── backend/                          # Node.js Express backend
│   ├── config/
│   │   ├── firebase.js               # Firebase configuration
│   │   ├── firebase-credentials.json # Firebase service account
│   │   └── google-credentials.json   # Google Drive API credentials
│   ├── middleware/
│   │   └── auth.js                   # Authentication & authorization
│   ├── routes/
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── grievances.js             # Grievance management endpoints
│   │   ├── notes.js                  # Notes sharing endpoints
│   │   └── alumni.js                 # Alumni directory endpoints
│   ├── utils/
│   │   ├── googleDrive.js            # Google Drive integration
│   │   └── mailer.js                 # Email notification service
│   ├── models/                       # Data models (Firestore)
│   ├── server.js                     # Express app initialization
│   ├── seed.js                       # Database seeding script
│   └── add-mock-users.js            # Mock user generation
├── frontend/                         # React Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx            # Navigation component
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication context provider
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx        # Login/Register layout
│   │   │   └── MainLayout.jsx        # Dashboard layout
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration page
│   │   │   ├── OTPVerification.jsx   # OTP verification page
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── StudentDashboard.jsx  # Student-specific dashboard
│   │   │   ├── TeacherDashboard.jsx  # Teacher-specific dashboard
│   │   │   ├── Grievances.jsx        # Grievance listing page
│   │   │   ├── GrievanceDetails.jsx  # Grievance detail page
│   │   │   ├── Notes.jsx             # Notes listing page
│   │   │   └── Alumni.jsx            # Alumni directory page
│   │   ├── services/
│   │   │   └── api.js                # Axios API client
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── vite.config.js                # Vite configuration
│   ├── package.json
│   └── eslint.config.js
├── uploads/                          # Temporary file uploads
├── package.json                      # Root package.json
└── .env                              # Environment variables (not in repo)
```

## Installation & Setup

### Prerequisites
- Node.js v18+ and npm installed
- Firebase project created and configured
- Google Drive API enabled in Google Cloud Platform
- Email service credentials (for Nodemailer)

### Backend Setup

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Download your Firebase service account JSON
   - Place it in `backend/config/firebase-credentials.json`
   - Set `FIREBASE_PROJECT_ID` in `.env`

3. **Configure Google Drive API:**
   - Set up Google Cloud Project and enable Google Drive API
   - Create service account credentials
   - Place the JSON file in `backend/config/google-credentials.json`

4. **Create `.env` file in root:**
   ```env
   PORT=3000
   FIREBASE_PROJECT_ID=your-firebase-project-id
   JWT_SECRET=your-secret-key-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Frontend Setup

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API endpoint (in `frontend/src/services/api.js`):**
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

## Running the Application

### Development Mode (Both Backend & Frontend)
```bash
npm run dev
```

This will run:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:5173` (Vite default)

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm run client
```

### Production Build
```bash
npm run build
```

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/verify-otp` | Verify OTP | No |
| POST | `/api/auth/refresh` | Refresh JWT token | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Grievance Endpoints
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|----------------|------|
| POST | `/api/grievances` | Submit grievance | Yes | Student |
| GET | `/api/grievances` | Get all grievances | Yes | Student/Teacher/Admin |
| GET | `/api/grievances/:id` | Get grievance details | Yes | - |
| PUT | `/api/grievances/:id` | Update grievance status | Yes | Teacher/Admin |
| DELETE | `/api/grievances/:id` | Delete grievance | Yes | Student/Admin |
| POST | `/api/grievances/:id/reply` | Reply to grievance | Yes | Teacher/Admin |

### Notes Endpoints
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|----------------|------|
| POST | `/api/notes` | Upload note | Yes | Student/Teacher |
| GET | `/api/notes` | Get all notes | Yes | - |
| GET | `/api/notes/:id` | Get note details | Yes | - |
| DELETE | `/api/notes/:id` | Delete note | Yes | Owner/Admin |
| GET | `/api/notes/search` | Search notes | Yes | - |

### Alumni Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/alumni` | Get all alumni | Yes |
| POST | `/api/alumni` | Create alumni profile | Yes |
| GET | `/api/alumni/:id` | Get alumni details | Yes |
| PUT | `/api/alumni/:id` | Update alumni profile | Yes |
| DELETE | `/api/alumni/:id` | Delete alumni profile | Yes |

## Database Schema (Firestore Collections)

### Collections Structure

#### `users`
```json
{
  "_id": "string",
  "email": "string",
  "name": "string",
  "password": "string (hashed)",
  "role": "string (student|teacher|admin|alumni)",
  "phone": "string",
  "batch": "number",
  "branch": "string",
  "createdAt": "date"
}
```

#### `grievances`
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "string (Low|Medium|High)",
  "status": "string (Submitted|In Progress|Resolved|Closed)",
  "submittedBy": "string (user ID)",
  "attachmentLink": "string (Google Drive link)",
  "teacherReply": "string",
  "repliedBy": "string (user ID)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### `notes`
```json
{
  "_id": "string",
  "title": "string",
  "subject": "string",
  "semester": "string",
  "branch": "string",
  "tags": "string",
  "uploadedBy": "string (user ID)",
  "uploaderName": "string",
  "fileLink": "string (Google Drive link)",
  "type": "string (student|teacher)",
  "isOfficial": "boolean",
  "createdAt": "date"
}
```

#### `alumni`
```json
{
  "_id": "string",
  "name": "string",
  "batch": "number",
  "email": "string",
  "phone": "string",
  "currentPosition": "string",
  "company": "string",
  "description": "string",
  "linkedIn": "string",
  "createdAt": "date"
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# JWT Configuration
JWT_SECRET=your-secret-jwt-key
JWT_EXPIRY=7d

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@studentsupporthub.com

# Google Drive Configuration
GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json

# Frontend Configuration
VITE_API_URL=http://localhost:3000/api
```

## Usage Guide

### For Students
1. Register with your email and verify OTP
2. Log in to the dashboard
3. **Submit Grievances:** Navigate to Grievances → Submit New
4. **Upload Notes:** Go to Notes → Upload and share study materials
5. **Browse Alumni:** Visit Alumni section to connect with graduates

### For Teachers
1. Register as Teacher role
2. Access Teacher Dashboard
3. **Reply to Grievances:** View student grievances and provide feedback
4. **Upload Official Notes:** Share curriculum materials and classroom notes
5. **Student Management:** View student submissions and progress

### For Admins
1. Full access to all grievances
2. Manage user accounts and roles
3. Oversee all platform activities
4. Generate reports and analytics

## Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Firebase security rules
- ✅ Secure file upload handling
- ✅ Email verification for new accounts
- ✅ OTP-based authentication

## Testing

Test files are included for API validation:
- `test-api-upload.js` - Test file upload endpoints
- `test-drive-upload.js` - Test Google Drive integration
- `test-folder-access.js` - Test folder access permissions

Run tests with:
```bash
node test-api-upload.js
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Heroku
1. Install Heroku CLI
2. Log in: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set KEY=VALUE`
5. Deploy: `git push heroku main`

### Deploy to Firebase Hosting
```bash
firebase deploy
```

## Troubleshooting

### Common Issues

**1. Firebase Connection Error**
- Verify `firebase-credentials.json` is in `backend/config/`
- Check `FIREBASE_PROJECT_ID` in `.env`
- Ensure Firebase Firestore is enabled in your project

**2. Google Drive Upload Fails**
- Confirm `google-credentials.json` is properly placed
- Verify Google Drive API is enabled in Google Cloud Console
- Check service account has appropriate Drive permissions

**3. Email Notifications Not Sending**
- Verify SMTP credentials in `.env`
- For Gmail, use app-specific passwords (2FA enabled)
- Check email address is correct

**4. Port Already in Use**
- Change PORT in `.env`
- Or kill existing process: `lsof -ti:3000 | xargs kill -9`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/feature-name`
5. Open a Pull Request

## Future Enhancements

- [ ] Notification dashboard with real-time updates (WebSocket)
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Video conferencing for mentoring
- [ ] Payment gateway for premium features
- [ ] AI-powered grievance categorization
- [ ] Automated response suggestions
- [ ] Achievements and recognition system
- [ ] Event management system
- [ ] Marketplace for internships

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support & Contact

For support, issues, or suggestions:
- GitHub Issues: [https://github.com/adityapraja/studentsupporthub/issues](https://github.com/adityapraja/studentsupporthub/issues)
- Email: support@studentsupporthub.com

## Acknowledgments

- Built with Express.js and React
- Powered by Firebase and Google Drive
- Thanks to the open-source community

---

**Version:** 1.0.0  
**Last Updated:** 2026  
**Maintained by:** Aditya Praja