"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState(null);

  // Fetch logged-in user from /api/auth/me
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="flex flex-col items-center text-center  px-16 py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Level Up Your Skills With{" "}
          <span className="text-red-400">Expert Mentorship</span>
        </h1>

        <p className="text-gray-600 text-lg mt-6 max-w-2xl">
          Connect with industry-leading mentors, access curated courses, and 
          accelerate your learning journey.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-10">
          <Link
            href="/courses"
            className="px-6 py-3 bg-red-400 text-white rounded-lg font-semibold hover:bg-red-500 transition flex items-center gap-2"
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
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-400">10K+</h2>
            <p className="text-gray-600">Active Learners</p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-400">500+</h2>
            <p className="text-gray-600">Expert Mentors</p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-400">1000+</h2>
            <p className="text-gray-600">Courses</p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-400">95%</h2>
            <p className="text-gray-600">Success Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
}
