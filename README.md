# SkillSync

**SkillSync** is an AI-powered skill development platform designed to bridge the gap between students and mentors. It provides a structured environment for learning, course management, and real-time progress tracking.

## Features

- **Role-Based Dashboards**: Targeted experiences for **Students** and **Mentors**.
- **Course Management**: Mentors can create, edit, and publish comprehensive courses.
- **Enrollment & Tracking**: Students can enroll in courses and track their progress.
- **Resource Library**: Curated learning materials.
- **Secure Authentication**: JWT-based auth with secure cookies.
- **Search & Filtering**: Advanced filtering by category, level, and price.
- **Responsive Design**: Built with Tailwind CSS for a seamless mobile and desktop experience.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) using [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT & Bcrypt
- **Icons**: [Lucide React](https://lucide.dev/)



## System Architecture
**Architecture Flow**: Frontend (Next.js) → Backend (Next.js API Routes) → Database (PostgreSQL via Prisma)

### Frontend
- **Next.js 16 (App Router)**: For robust routing and server-side rendering.
- **Tailwind CSS v4**: For modern, responsive styling.
- **Lucide React**: For consistent iconography.
- **Axios / Fetch**: For HTTP requests.

### Backend
- **Next.js API Routes**: Serverless functions handling business logic.
- **Prisma ORM**: For type-safe database interactions.
- **JWT Authentication**: Secure stateless authentication.
- **Bcrypt**: For password hashing.

### Database
- **PostgreSQL**: Relational database for structured data (Users, Courses, Enrollments).

### Hosting
- **Frontend & Backend**: Vercel (recommended for Next.js).
- **Database**: Neon / Supabase / Railway (PostgreSQL providers).

## Key Features
- **Role-Based Access Control**: specialized dashboards for **Students** and **Mentors**.
- **Authentication**: Secure Signup/Login with JWT and cookie-based sessions.
- **Course Management**: Mentors can create, edit, and publish courses with rich details (images, duration, price, level).
- **Enrollment System**: Students can browse, filter, and enroll in courses.
- **Progress Tracking**: Students can track their learning progress (deduced from schema `Enrollment.progress`).
- **Resource Library**: Curated resources for students.
- **Advanced Search & Filtering**: Search courses by title; filter by category, level, and price.
- **Dynamic Leaderboards & Stats**: Real-time statistics for mentors (student count, views) and students (courses enrolled).

## Tech Stack
- **Frontend**: Next.js 16, Tailwind CSS 4, React 19
- **Backend API**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **Image Storage**: Cloudinary (deduced from `package.json` dependency)

## API Overview
The application exposes a RESTful API under `/api`. All protected routes require a valid JWT token in cookies.


| **Category** | **Endpoint**            | **Method** | **Description**                                   | **Access**        |
|--------------|--------------------------|------------|---------------------------------------------------|--------------------|
| **Auth**     | `/api/auth/signup`       | POST       | Register a new user (Student or Mentor)           | Public             |
|              | `/api/auth/login`        | POST       | Authenticate user & set HTTP-only cookie          | Public             |
| **Courses**  | `/api/courses`           | GET        | Get all courses (supports filters & pagination)   | Public / Auth      |
|              | `/api/courses`           | POST       | Create a new course                               | Mentor Only        |
|              | `/api/courses/[id]`      | GET        | Get details of a single course                    | Public / Auth      |
|              | `/api/courses/[id]`      | PUT        | Update course details (only mentor who owns it)   | Mentor Only        |
|              | `/api/courses/[id]`      | DELETE     | Delete a course                                   | Mentor Only        |
| **Mentors**  | `/api/mentors`           | GET        | List all mentors                                   | Public             |
| **Users**    | `/api/profile`           | GET        | Get currently logged-in user profile               | Authenticated User |
|              | `/api/profile`           | PUT        | Update profile information                         | Authenticated User |


## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- A PostgreSQL database (local or cloud-hosted like Neon, Supabase, etc.)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Anshuman-utd/SkillSync.git
   cd SkillSync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   
   # Optional: Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

6. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

The API is built using Next.js Route Handlers.

- **POST /api/auth/signup**: Register a new user.
- **POST /api/auth/login**: Log in and receive a session cookie.
- **GET /api/courses**: Fetch all courses (supports `search`, `category`, `level`, `page`, `limit`).
- **POST /api/courses**: Create a new course (Mentor only).
- **GET /api/courses/[id]**: specific course details.
- **GET /api/profile**: Get current user's profile.

## License

This project is licensed under the MIT License.
