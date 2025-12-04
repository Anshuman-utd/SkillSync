"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, Star, Users } from "lucide-react";

export default function MyCoursesPage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setUser(authData.user);

        const coursesRes = await fetch("/api/courses");
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          const myCourses = (coursesData.courses || []).filter(
            (c) => c.mentorEmail === authData.user.email
          );
          setCourses(myCourses);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function toggleFeature(id) {
    const res = await fetch(`/api/courses/${id}/feature`, { method: "PUT" });
    if (res.ok) {
      const data = await res.json();
      setCourses((prev) => 
        prev.map((c) => c.id === id ? { ...c, isFeatured: data.isFeatured } : c)
      );
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please login.</div>;

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <Link
          href="/dashboard/mentor/courses/create"
          className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Add New Course
        </Link>
      </div>

      {/* ---------------- COURSE GRID ---------------- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image Section */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={course.image || "https://placehold.co/600x400?text=No+Image"}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => toggleFeature(course.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    course.isFeatured
                      ? "bg-yellow-400 text-white"
                      : "bg-gray-800/80 text-white hover:bg-gray-900"
                  }`}
                >
                  {course.isFeatured ? "Featured" : "Feature"}
                </button>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                  PUBLISHED
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{course.studentCount || 0} students</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="font-medium text-gray-700">{course.rating || "4.8"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                 <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                    {course.category || "General"}
                 </span>
                 <span className="text-xs text-gray-400 ml-auto">
                    Created: {new Date().toLocaleDateString()}
                 </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <Link
                  href={`/courses/${course.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Eye size={16} /> View
                </Link>
                <Link 
                  href={`/dashboard/mentor/courses/${course.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Edit size={16} /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <PlusCircle size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Create your first course to get started.</p>
            <Link
              href="/dashboard/mentor/courses/create"
              className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
            >
              Create Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
