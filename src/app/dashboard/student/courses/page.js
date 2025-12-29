"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import CourseCard from "@/components/CourseCard";

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

      <div className="grid md:grid-cols-3 gap-5">
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((enrollment) => (
            <CourseCard
              key={enrollment.id}
              course={enrollment.course}
              isEnrolled={true}
              progress={enrollment.progress}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't enrolled in any courses yet. Browse our catalog to find your next learning adventure.</p>
            <Link href="/courses" className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors shadow-red-200 shadow-lg">
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
