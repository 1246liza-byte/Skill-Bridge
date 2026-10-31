# Skills Bridge

A complete MERN Stack student skills and freelancing marketplace platform that connects talented students with clients who need real-world work done.

## 🎨 Design Theme

- **Deep Navy Blue**: `#1B365D`
- **Accent Gold**: `#D4AF37`
- **White**: `#FFFFFF`
- **Soft Background**: `#F8F9FA`
- **Light Blue**: `#E8EEF6`
- **Dark Text**: `#263445`

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express** - REST API
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** + **bcrypt** - Authentication & security
- **Socket.IO** - Real-time messaging & notifications
- **Multer** + **Cloudinary** - File uploads
- **Helmet**, **CORS**, **express-rate-limit** - Security
- **express-validator** - Input validation

### Frontend
- **React.js** + **Vite** - UI framework
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API** - State management
- **Socket.IO Client** - Real-time features

## 📁 Project Structure

```
skill/
├── backend/                 # Express REST API
│   ├── config/              # Configuration & DB connection
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, error handling, uploads
│   ├── models/              # 18 Mongoose models
│   ├── routes/              # 18 route files
│   ├── scripts/             # Seed & admin creation scripts
│   ├── services/            # Notification service
│   ├── sockets/             # Socket.IO setup
│   ├── utils/               # Helpers
│   ├── uploads/             # Local file uploads
│   ├── app.js               # Express app
│   └── server.js            # Server entry point
│
└── client/                  # React frontend
    └── src/
        ├── api/             # Axios API services
        ├── components/      # Layout & UI components
        ├── context/         # Auth, Notification, Site contexts
        ├── pages/           # Public, Student, Client, Admin pages
        └── utils/           # Helpers & socket
```

## 🗄️ Database Collections (18)

1. **Users** - Students, clients, admins
2. **StudentProfiles** - Student details, skills, portfolio
3. **ClientProfiles** - Company details, saved students
4. **Projects** - Job postings
5. **Proposals** - Student applications
6. **HiringOffers** - Direct client offers
7. **Hires** - Active work agreements
8. **Conversations** - Messaging threads
9. **Messages** - Chat messages
10. **Notifications** - User notifications
11. **Categories** - Project categories
12. **Skills** - Skill tags
13. **Banners** - Homepage banners
14. **SiteSettings** - Site content & branding
15. **ContactMessages** - Contact form submissions
16. **Reports** - User reports
17. **Reviews** - Ratings & reviews
18. **AuditLogs** - Admin action logs

## 👥 Role-Based Panels

### Student Panel
- Dashboard with stats
- Profile management (skills, portfolio, rates)
- Browse & apply to projects
- Track proposals, offers, and hires
- Messaging & notifications

### Client Panel
- Dashboard with stats
- Company profile management
- Post & manage projects
- Review proposals & send hiring offers
- Save students & manage hires
- Messaging & notifications

### Admin Panel
- Platform-wide dashboard
- User management (suspend/restore/delete)
- Project moderation
- Category & skill management
- Banner & site content management
- Report & contact message handling
- Audit log viewing

## 🔐 Hiring Workflow

**Workflow A (Student applies):**
1. Student submits a proposal on a project
2. Client reviews and accepts/rejects the proposal
3. Accepting creates an active Hire record

**Workflow B (Client offers):**
1. Client sends a direct hiring offer to a student
2. Student accepts/rejects the offer
3. Accepting creates an active Hire record

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillsbridge
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

Seed the database with sample data:

```bash
npm run seed
```

Create an admin account:

```bash
npm run create-admin
```

Start the backend:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies API requests to the backend on `http://localhost:5000`.

### 3. Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Student | `student1@skillsbridge.com` | `Student@123` |
| Client | `client1@skillsbridge.com` | `Client@123` |
| Admin | (set via `npm run create-admin`) | (set via script) |

## 🔒 Security Features

- bcrypt password hashing
- JWT-based authentication
- Role-based access control (RBAC)
- Admin privileges enforced on the backend
- No privilege escalation (role changes blocked)
- Rate limiting on API
- Helmet security headers
- Audit logging for sensitive admin actions
- Input validation with express-validator

## 📦 Production Build

```bash
# Backend
cd backend
npm start

# Frontend
cd client
npm run build
```

## 📄 License

This project is for educational and demonstration purposes.