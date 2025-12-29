"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, Star, Users, PlusCircle } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import CourseCard from "@/components/CourseCard";

export default function MyCoursesPage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Open modal instead of deleting immediately
  function confirmDelete(course) {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
        setDeleteModalOpen(false);
        setCourseToDelete(null);
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
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
          <CourseCard
            key={course.id}
            course={course}
            isMentor={true}
            toggleFeature={toggleFeature}
            onDelete={confirmDelete}
          />
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone and will remove all student enrollments.`}
        confirmText="Yes, Delete Course"
        isDeleting={isDeleting}
      />
    </div>
  );
}
