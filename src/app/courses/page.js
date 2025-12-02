"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

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

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        const data = await res.json();
        setAllCourses(data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchCourses();
  }, []);

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
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-4 py-2 rounded-lg bg-white"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Level */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border px-4 py-2 rounded-lg bg-white"
        >
          {levels.map((lvl) => (
            <option key={lvl}>{lvl}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-4 py-2 rounded-lg bg-white"
        >
          {sortOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
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
              <div className="text-sm text-gray-600 mt-1">
                👨‍🏫 {course.mentor}
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
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
