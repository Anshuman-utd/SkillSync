"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Users } from "lucide-react";

// Dummy data (replace with API fetch later)

const categories = [
  "All Categories",
  "Web Dev",
  "UI/UX",
  "AI/ML",
  "Mobile Dev",
  "Cloud",
  "Data Science",
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const sortOptions = ["Most Popular", "Rating", "Newest"];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [level, setLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch User
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          setUser(authData.user);
          
          if (authData.user.role === "STUDENT") {
             const profileRes = await fetch("/api/users/profile");
             if (profileRes.ok) {
                const profileData = await profileRes.json();
                setEnrolledCourseIds(profileData.profile.enrolledCourses?.map(c => c.id) || []);
             }
          }
        }

        // Fetch Courses with Pagination
        const res = await fetch(`/api/courses?page=${page}&limit=${LIMIT}`, { cache: "no-store" });
        const data = await res.json();
        setAllCourses(data.courses);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, [page]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      alert("Please login to enroll");
      return;
    }
    if (user.role !== "STUDENT") {
      alert("Only students can enroll in courses");
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        alert("Enrolled successfully!");
        setEnrolledCourseIds([...enrolledCourseIds, courseId]);
        // Update student count locally
        setAllCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, studentCount: (c.studentCount || 0) + 1 } : c
          )
        );
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Enrollment failed", error);
    }
  };

  // ----------------------------------------------
  // Filtering Logic
  // ----------------------------------------------
  const courses = useMemo(() => {
    let filtered = allCourses.filter((course) => {
      return (
        (category === "All Categories" || course.category === category) &&
        (level === "All Levels" || course.level === level) &&
        course.title.toLowerCase().includes(search.toLowerCase())
      );
    });
  
    if (sortBy === "Rating") filtered.sort((a, b) => b.rating - a.rating);
    if (sortBy === "Newest") filtered = filtered.reverse();
  
    return filtered;
  }, [search, category, level, sortBy, allCourses]);
  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-12">

      {/* -------------------------------- HEADER -------------------------------- */}
      <h1 className="text-4xl font-bold">Explore Courses</h1>
      <p className="text-gray-600 mt-2">
        Discover your next learning adventure
      </p>

      {/* -------------------------------- SEARCH + FILTERS -------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-10">

        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-lg w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search courses..."
            className="bg-transparent outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters Button (mobile) */}
        <button className="md:hidden border px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700">
          <span>Filters</span>
        </button>
      </div>

      {/* Dropdown Filters */}
      {/* Dropdown Filters */}
      <div className="flex flex-wrap gap-4 mt-6">
        {/* Category */}
        <div className="relative">
            <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none border border-gray-200 px-4 py-2 pr-8 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition shadow-sm"
            >
            {categories.map((cat) => (
                <option key={cat}>{cat}</option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>

        {/* Level */}
        <div className="relative">
            <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="appearance-none border border-gray-200 px-4 py-2 pr-8 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition shadow-sm"
            >
            {levels.map((lvl) => (
                <option key={lvl}>{lvl}</option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>

        {/* Sort */}
        <div className="relative">
            <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none border border-gray-200 px-4 py-2 pr-8 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition shadow-sm"
            >
            {sortOptions.map((opt) => (
                <option key={opt}>{opt}</option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
      </div>

      {/* -------------------------------- COUNT -------------------------------- */}
      <p className="mt-8 text-gray-600">
        Showing {courses.length} courses
      </p>

      {/* -------------------------------- GRID OF COURSES -------------------------------- */}
      <div className="grid md:grid-cols-3 gap-10 mt-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white shadow-md rounded-xl overflow-hidden p-3 relative"
          >
            {/* Image */}
            <Image
              src={course.image}
              width={600}
              height={400}
              alt={course.title}
              className="rounded-lg"
            />

            {/* Category Tag */}
            <span className="absolute top-4 right-4 bg-red-400 text-white px-3 py-1 rounded-full text-xs">
              {course.category}
            </span>

            <div className="p-4">
              {/* Title */}
              <h3 className="font-bold text-lg">{course.title}</h3>

              {/* Mentor */}
              <div className="flex items-center gap-2 mt-2">
                {course.mentorImage ? (
                    <img src={course.mentorImage} alt={course.mentor} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        {course.mentor?.[0]}
                    </div>
                )}
                <span className="text-sm text-gray-600">{course.mentor}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Users size={14} />
                <span>{course.studentCount || 0} students</span>
              </div>

              {/* Rating & Duration */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>⭐ {course.rating}</span>
                <span>⏳ {course.duration}</span>
              </div>

              {/* Level */}
              <span className="inline-block mt-4 text-xs bg-gray-100 px-3 py-1 rounded-full">
                {course.level}
              </span>

              {/* Button */}
              <Link
                href={`/courses/${course.id}`}
                className="block w-full mt-4 bg-red-400 hover:bg-red-500 text-white text-center py-2 rounded-lg transition"
              >
                View Details
              </Link>

              {user?.role === "STUDENT" && (
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolledCourseIds.includes(course.id)}
                  className={`block w-full mt-2 text-center py-2 rounded-lg transition ${
                    enrolledCourseIds.includes(course.id)
                      ? "bg-green-100 text-green-600 cursor-default"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  {enrolledCourseIds.includes(course.id) ? "Enrolled" : "Enroll Now"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------- PAGINATION -------------------------------- */}
      <div className="flex justify-center mt-12 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>

    </div>
  );
}
