"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BookOpen, Star, TrendingUp, PlusCircle } from "lucide-react";

export default function MentorDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    avgRating: "0.0",
    totalViews: 0,
  });

  // ---------------- FETCH USER ----------------
  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  // ---------------- LOAD STATS & COURSES ----------------
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      // Stats
      const statsRes = await fetch("/api/stats/mentor");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // Courses (Limit to recent 3 for dashboard)
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const myCourses = (data.courses || []).filter(
          (c) => c.mentorEmail === user.email
        );
        setCourses(myCourses.slice(0, 3));
      }
    }
    loadData();
  }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login.</div>;

  return (
    <div>
      {/* ---------------- STATS CARDS ---------------- */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Total Students</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">
                {stats.totalStudents.toLocaleString()}
              </h2>
              <p className="text-gray-400 text-xs mt-1">+180 this month</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Active Courses</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">
                {stats.activeCourses}
              </h2>
              <p className="text-gray-400 text-xs mt-1">3 drafts</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <BookOpen size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Average Rating</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">
                {stats.avgRating}
              </h2>
              <p className="text-gray-400 text-xs mt-1">850 reviews</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <Star size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Growth</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">{stats.totalViews}</h2>
              <p className="text-gray-400 text-xs mt-1">Total views</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- MY COURSES SECTION ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Link
            href="/dashboard/mentor/courses/create"
            className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            Add New Course
          </Link>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
              <th className="py-4 font-medium w-1/3">Course Title</th>
              <th className="py-4 font-medium">Students</th>
              <th className="py-4 font-medium">Rating</th>
              <th className="py-4 font-medium">Status</th>
              <th className="py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((c) => (
              <tr key={c.id} className="group hover:bg-gray-50 transition-colors">
                <td className="py-4 font-medium text-gray-900">{c.title}</td>
                <td className="py-4 text-gray-600">
                  {c.studentCount || 0}
                </td>
                <td className="py-4 flex items-center gap-1 text-gray-900 font-medium">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  {c.rating || "0.0"}
                </td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      c.status === "PUBLISHED"
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status || "Draft"}
                  </span>
                  {c.isFeatured && (
                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                        Featured
                    </span>
                  )}
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition-colors">
                      Edit
                    </button>
                    <Link
                      href={`/courses/${c.id}`}
                      className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  No courses found. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
