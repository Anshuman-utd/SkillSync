# SkillSync – AI-Powered Skill Development Platform

## Project Title
**SkillSync – AI-Powered Skill Development & Mentorship Platform**

---

## Problem Statement
Students often struggle to find structured learning paths and direct access to mentors, while mentors lack a centralized platform to manage courses and track student engagement. SkillSync addresses this gap by providing a role-based, scalable platform where students can learn, enroll in courses, track progress, and communicate with mentors in real time.

---

## System Architecture
**Architecture Flow:**  
Frontend (Next.js App Router) → Backend (Next.js API Routes + WebSocket Server) → Database (PostgreSQL via Prisma)

---

## Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion for UI animations
- Lucide React for icons
- Fetch / Axios for HTTP requests

---

## Backend
- Next.js API Routes
- JWT authentication with HTTP-only cookies
- bcrypt for password hashing
- WebSocket server for real-time chat

---

## Database
- PostgreSQL
- Prisma ORM (type-safe queries)

---

## Hosting
- Frontend & API: Vercel
- Database: Neon / Supabase / Railway (PostgreSQL)
- WebSocket Server: Render / Railway / VPS

---

## Key Features
- **Role-Based Access Control:** Separate dashboards for Students and Mentors  
- **Authentication & Authorization:** Secure JWT-based login/signup with cookies  
- **Course Management:** Mentors can create, edit, publish, and delete courses  
- **Enrollment System:** Students can enroll in courses and view progress  
- **Progress Tracking:** Course progress tracked via enrollment schema  
- **Real-Time Chat:** Mentor–Student chat using WebSockets  
- **Search / Filtering:** Filter courses by category, level, and price  
- **Pagination:** Server-side pagination for course listings  
- **Animations:** Smooth UI transitions using Framer Motion  
- **Responsive UI:** Mobile-first design with Tailwind CSS  

---

## Tech Stack
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Framer Motion
- **Backend:** Next.js API Routes, WebSockets
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** JWT, bcrypt
- **Media Storage:** Cloudinary
- **Hosting:** Vercel, Neon / Supabase / Railway

---

## API Overview
All API routes are mounted under `/api`.  
Protected routes require a valid JWT (stored in HTTP-only cookies).

### Authentication
| Endpoint | Method | Description | Access |
|--------|--------|-------------|--------|
| /api/auth/signup | POST | Register a new user (Student or Mentor) | Public |
| /api/auth/login | POST | Authenticate user and set session cookie | Public |

---

### Courses
| Endpoint | Method | Description | Access |
|--------|--------|-------------|--------|
| /api/courses | GET | Get all courses (filters & pagination) | Public / Auth |
| /api/courses | POST | Create a new course | Mentor |
| /api/courses/[id] | GET | Get course details | Public / Auth |
| /api/courses/[id] | PUT | Update course (owner mentor only) | Mentor |
| /api/courses/[id] | DELETE | Delete course (owner mentor only) | Mentor |

---

### Mentors
| Endpoint | Method | Description | Access |
|--------|--------|-------------|--------|
| /api/mentors | GET | List all mentors | Public |

---

### User Profile
| Endpoint | Method | Description | Access |
|--------|--------|-------------|--------|
| /api/profile | GET | Get current user profile | Authenticated |
| /api/profile | PUT | Update user profile | Authenticated |

---

## Real-Time Chat (WebSockets)
- Persistent WebSocket connection
- Enables instant mentor ↔ student messaging
- Server hosted separately for scalability

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- PostgreSQL database (Neon / Supabase / Railway recommended)

---

### Installation
```bash
git clone https://github.com/Anshuman-utd/SkillSync.git
cd SkillSync
npm install

---

### Environment Variables

Create a .env file in the root directory:

DATABASE_URL=postgresql://user:password@host:port/dbname?schema=public
JWT_SECRET=your_jwt_secret

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


Database Setup

npx prisma generate
npx prisma migrate dev --name init


Run Development Server
npm run dev


Open http://localhost:3000