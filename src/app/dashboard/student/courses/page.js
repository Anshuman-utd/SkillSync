"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentCoursesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setUser(authData.user);

        if (authData.user.role === "STUDENT") {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Learning</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
              <div className="h-40 relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700">
                    {course.level}
                </span>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4">by {course.mentorName}</p>
                
                <div className="mt-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                        <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress || 0}%` }}
                        ></div>
                    </div>

                    <Link
                        href={`/courses/${course.id}`}
                        className="block w-full bg-red-50 text-red-500 hover:bg-red-100 text-center py-2 rounded-lg font-medium transition-colors"
                    >
                        Continue Learning
                    </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <Link href="/courses" className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500">
                Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
