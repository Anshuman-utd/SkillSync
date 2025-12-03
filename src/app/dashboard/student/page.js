
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Award, Clock, TrendingUp, Star } from "lucide-react";

export default function StudentDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    certificatesEarned: 0,
    learningHours: 0,
    progress: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setUser(authData.user);

        if (authData.user.role === "STUDENT") {
          // Fetch Stats
          const statsRes = await fetch("/api/stats/student");
          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data.stats);
          }

          // Fetch Enrolled Courses
          const enrollRes = await fetch("/api/enrollments");
          if (enrollRes.ok) {
            const data = await enrollRes.json();
            setEnrolledCourses(data.enrolled || []);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please login.</div>;
  if (user.role !== "STUDENT") return <div className="p-8 text-red-500">Access denied.</div>;

  return (
    <div>
      {/* ---------------- STATS CARDS ---------------- */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Enrolled Courses</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">{stats.enrolledCount}</h2>
              <p className="text-gray-400 text-xs mt-1">Active learning</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <BookOpen size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Certificates</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">{stats.certificatesEarned}</h2>
              <p className="text-gray-400 text-xs mt-1">Earned so far</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <Award size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Learning Hours</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">{stats.learningHours}</h2>
              <p className="text-gray-400 text-xs mt-1">Total time spent</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Avg. Progress</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">{stats.progress}%</h2>
              <p className="text-gray-400 text-xs mt-1">Across all courses</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- ENROLLED COURSES ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Learning</h2>
          <Link
            href="/courses"
            className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            Browse More Courses
          </Link>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
              <th className="py-4 font-medium w-1/3">Course Title</th>
              <th className="py-4 font-medium">Mentor</th>
              <th className="py-4 font-medium">Progress</th>
              <th className="py-4 font-medium">Status</th>
              <th className="py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {enrolledCourses.map((c) => (
              <tr key={c.id} className="group hover:bg-gray-50 transition-colors">
                <td className="py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                        <img src={c.image} alt={c.title} className="w-10 h-10 rounded-lg object-cover" />
                        <span>{c.title}</span>
                    </div>
                </td>
                <td className="py-4 text-gray-600">{c.mentorName}</td>
                <td className="py-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${c.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">{c.progress || 0}%</span>
                </td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      c.completed
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {c.completed ? "Completed" : "In Progress"}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <Link
                    href={`/courses/${c.id}`}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:border-gray-300 transition-colors"
                  >
                    Continue
                  </Link>
                </td>
              </tr>
            ))}
            {enrolledCourses.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  You haven't enrolled in any courses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
