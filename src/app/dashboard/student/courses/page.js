"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

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
            <div
                key={enrollment.id}
                className="bg-white shadow-md rounded-xl overflow-hidden p-3 relative flex flex-col h-full"
            >
                {/* Image */}
                <div className="relative h-40 w-full bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                    <img
                        src={enrollment.course?.image || "https://placehold.co/600x400?text=No+Image"}
                        alt={enrollment.course?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x400?text=No+Image";
                        }}
                    />
                </div>

                {/* Category Tag */}
                {enrollment.course?.category && (
                    <span className="absolute top-5 right-5 bg-red-400 text-white px-2 py-0.5 rounded-full text-[10px] z-10 shadow-sm">
                        {enrollment.course.category.name}
                    </span>
                )}

                <div className="p-3 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem] mb-1">{enrollment.course?.title}</h3>

                    {/* Mentor */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {enrollment.course?.mentor?.user?.name?.[0] || "M"}
                        </span>
                        <span className="text-sm text-gray-600 truncate">{enrollment.course?.mentor?.user?.name || "Unknown Mentor"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Users size={14} />
                        <span>{enrollment.course?.studentCount || 0} students</span>
                    </div>

                    {/* Level */}
                    <div className="mt-4 mb-4">
                        <span className="inline-block text-xs bg-gray-100 px-3 py-1 rounded-full">
                            {enrollment.course?.level || "All Levels"}
                        </span>
                    </div>

                    {/* Spacer to push buttons down */}
                    <div className="flex-grow"></div>

                    {/* Progress Section */}
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                            <span>Progress</span>
                            <span>{enrollment.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    enrollment.completed ? "bg-green-500" : "bg-blue-600"
                                }`}
                                style={{ width: `${enrollment.progress || 0}%` }}
                            ></div>
                        </div>

                        <Link
                            href={`/courses/${enrollment.courseId}`}
                            className={`block w-full text-center py-2 rounded-lg transition font-medium ${
                                enrollment.completed 
                                ? "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                                : "bg-red-400 hover:bg-red-500 text-white"
                            }`}
                        >
                            {enrollment.completed ? "View Course" : "Continue Learning"}
                        </Link>
                    </div>
                </div>
            </div>
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
