SkillSync 🚀

AI-Powered Skill Development & Mentorship Platform

SkillSync is a full-stack, AI-powered learning platform designed to bridge the gap between students and mentors. It enables structured learning, real-time collaboration, progress tracking, and mentor-student interaction through modern web technologies.

✨ Key Features
🎭 Role-Based Experience

Separate dashboards for Students and Mentors

Role-based access control (RBAC)

📚 Course Management

Mentors can create, edit, publish, and delete courses

Rich course metadata (title, description, level, duration, price, images)

🎓 Enrollment & Progress Tracking

Students can enroll in courses

Progress tracked via Enrollment.progress

🔍 Advanced Search & Filtering

Search by course title

Filter by category, level, and price

Pagination support

💬 Real-Time Chat (NEW)

Mentor ↔ Student real-time chat

Powered by WebSockets

Enables instant doubt solving and interaction

📊 Dashboards & Stats

Mentor stats: students enrolled, course views

Student stats: enrolled courses & progress

🔐 Secure Authentication

JWT-based authentication

HTTP-only cookies

Password hashing with bcrypt

🎨 Modern UI & Animations

Fully responsive UI with Tailwind CSS

Smooth animations using Framer Motion


🧱 System Architecture

Frontend (Next.js App Router)
        ↓
Backend (Next.js API Routes + WebSocket Server)
        ↓
Database (PostgreSQL via Prisma ORM)


🖥️ Tech Stack
Frontend

Next.js 16 (App Router)

React 19

Tailwind CSS v4

Framer Motion (animations)

Lucide React (icons)

Fetch / Axios (API communication)

Backend

Next.js API Routes

JWT Authentication

Bcrypt (password hashing)

WebSockets (real-time chat)

Database

PostgreSQL

Prisma ORM

Media & Assets

Cloudinary (image uploads)


Real-Time Chat Architecture (NEW)

WebSocket server hosted separately

Persistent bi-directional connection

Enables:

Real-time mentor-student messaging

Scalable communication layer

Client (Next.js)
   ↕ WebSocket
WebSocket Server (Node.js)


🔗 API Overview

All APIs are exposed under /api.
Protected routes require a valid JWT (via cookies).

Auth
Endpoint	Method	Description	Access
/api/auth/signup	POST	Register a user (Student/Mentor)	Public
/api/auth/login	POST	Login & set session cookie	Public
Courses
Endpoint	Method	Description	Access
/api/courses	GET	Get all courses (filters & pagination)	Public/Auth
/api/courses	POST	Create course	Mentor
/api/courses/[id]	GET	Course details	Public/Auth
/api/courses/[id]	PUT	Update course	Mentor
/api/courses/[id]	DELETE	Delete course	Mentor
Users
Endpoint	Method	Description	Access
/api/profile	GET	Get current user	Auth
/api/profile	PUT	Update profile	Auth
Mentors
Endpoint	Method	Description	Access
/api/mentors	GET	List all mentors	Public
🚀 Getting Started
Prerequisites

Node.js v18+

PostgreSQL database (Neon / Supabase / Railway)


Installation

git clone https://github.com/Anshuman-utd/SkillSync.git
cd SkillSync
npm install

Database Setup
npx prisma generate
npx prisma migrate dev --name init


Run Development Server
npm run dev

Open: http://localhost:3000

☁️ Hosting & Deployment
Frontend + API

Vercel (recommended for Next.js)

Database

Neon

Supabase

Railway

WebSocket Server

Deployed separately (Node.js)

Can be hosted on:

Railway

Render

VPS

🧠 Future Improvements

AI-powered course recommendations

AI mentor assistant (Gemini / OpenAI)

Video calling integration

Notifications system

Admin dashboard


