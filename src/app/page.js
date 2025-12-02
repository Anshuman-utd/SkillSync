"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else setUser(null);
      } catch (err) {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white text-black">

      {/* -------------------------------- HERO SECTION ------------------------------- */}
      <section className="flex flex-col items-center text-center px-6 md:px-16 py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Level Up Your Skills With{" "}
          <span className="text-red-400">Expert Mentorship</span>
        </h1>

        <p className="text-gray-600 text-lg mt-6 max-w-2xl">
          Connect with industry-leading mentors, access curated courses, and
          accelerate your learning journey.
        </p>

        <div className="flex gap-4 mt-10">
          <Link
            href="/courses"
            className="px-6 py-3 bg-red-400 text-white rounded-lg font-semibold hover:bg-red-500 transition"
          >
            Explore Courses →
          </Link>

          <Link
            href="/mentors"
            className="px-6 py-3 border rounded-lg font-semibold text-gray-800 hover:bg-gray-100 transition"
          >
            Find a Mentor
          </Link>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-12 mt-20">
          {[
            ["10K+", "Active Learners"],
            ["500+", "Expert Mentors"],
            ["1000+", "Courses"],
            ["95%", "Success Rate"],
          ].map(([num, label], index) => (
            <div key={index} className="text-center">
              <h2 className="text-3xl font-bold text-red-400">{num}</h2>
              <p className="text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------- FEATURED COURSES --------------------------- */}
      <section className="px-6 md:px-16 py-16 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Featured Courses</h2>
            <p className="text-gray-600">Handpicked courses from industry experts</p>
          </div>
          <Link
            href="/courses"
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-10 mt-12">

          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-3">
            <Image
              src="/assets/course1.jpg"
              width={600}
              height={400}
              alt="Course"
              className="rounded-lg"
            />
            <span className="absolute mt-4 ml-4 bg-red-400 text-white text-xs px-3 py-1 rounded-full">
              Web Dev
            </span>

            <div className="p-4">
              <h3 className="font-bold text-lg">Complete Web Development Bootcamp</h3>

              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span>👩‍🏫 Sarah Johnson</span>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>⭐ 4.8</span>
                <span>⏳ 12 weeks</span>
              </div>

              <span className="inline-block mt-4 text-xs bg-gray-100 px-3 py-1 rounded-full">
                Beginner
              </span>

              <button className="w-full mt-4 bg-red-400 hover:bg-red-500 text-white py-2 rounded-lg transition">
                View Details
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-3">
            <Image
              src="/assets/course2.jpg"
              width={600}
              height={400}
              alt="Course"
              className="rounded-lg"
            />
            <span className="absolute mt-4 ml-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
              UI/UX
            </span>

            <div className="p-4">
              <h3 className="font-bold text-lg">UI/UX Design Masterclass</h3>

              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span>👨‍🏫 Mike Chen</span>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>⭐ 4.9</span>
                <span>⏳ 8 weeks</span>
              </div>

              <span className="inline-block mt-4 text-xs bg-gray-100 px-3 py-1 rounded-full">
                Intermediate
              </span>

              <button className="w-full mt-4 bg-red-400 hover:bg-red-500 text-white py-2 rounded-lg transition">
                View Details
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-3">
            <Image
              src="/assets/course3.jpg"
              width={600}
              height={400}
              alt="Course"
              className="rounded-lg"
            />
            <span className="absolute mt-4 ml-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
              AI/ML
            </span>

            <div className="p-4">
              <h3 className="font-bold text-lg">Machine Learning Fundamentals</h3>

              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span>👩‍🏫 Dr. Emily Rodriguez</span>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>⭐ 4.7</span>
                <span>⏳ 10 weeks</span>
              </div>

              <span className="inline-block mt-4 text-xs bg-gray-100 px-3 py-1 rounded-full">
                Advanced
              </span>

              <button className="w-full mt-4 bg-red-400 hover:bg-red-500 text-white py-2 rounded-lg transition">
                View Details
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------- CATEGORIES SECTION ------------------------ */}
      <section className="px-6 md:px-16 py-20">
        <h2 className="text-3xl font-bold text-center">Browse by Category</h2>
        <p className="text-gray-600 text-center mt-2">
          Explore courses across various domains
        </p>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mt-12">

          {[
            ["💻", "Web Development", 245],
            ["🎨", "UI/UX Design", 182],
            ["🤖", "AI & Machine Learning", 156],
            ["☁️", "Cloud Computing", 128],
            ["📱", "Mobile Development", 198],
            ["📊", "Data Science", 174],
          ].map(([icon, name, count]) => (
            <div
              key={name}
              className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow hover:shadow-md cursor-pointer transition"
            >
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-3 font-semibold">{name}</h3>
              <p className="text-gray-500 text-sm">{count} courses</p>
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}
