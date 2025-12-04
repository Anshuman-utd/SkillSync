"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Star, Users } from "lucide-react";

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchMentors() {
      try {
        const res = await fetch("/api/mentors");
        if (res.ok) {
          const data = await res.json();
          setMentors(data.mentors);
        }
      } catch (error) {
        console.error("Failed to load mentors", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.expertise?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-12">
      {/* ---------------- HEADER ---------------- */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Find Your Mentor</h1>
        <p className="text-gray-600 text-lg">
          Connect with industry experts to guide your learning journey
        </p>
      </div>

      {/* ---------------- SEARCH & FILTERS ---------------- */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search mentors by name or expertise..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 border border-gray-200 rounded-xl flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors">
          <Filter size={20} /> Filters
        </button>
      </div>

      <p className="text-gray-500 mb-6">Showing {filteredMentors.length} mentors</p>

      {/* ---------------- MENTORS GRID ---------------- */}
      {loading ? (
        <div className="text-center py-20">Loading mentors...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              <div className="relative mb-4">
                <img
                  src={mentor.image || "https://placehold.co/150"}
                  alt={mentor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                />
                <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-gray-100">
                    <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
              
              <div className="flex items-center gap-1 text-yellow-500 font-medium mt-1 mb-2">
                <Star size={16} fill="currentColor" />
                <span>{mentor.avgRating}</span>
                <span className="text-gray-400 font-normal text-sm">({mentor.totalStudents} students)</span>
              </div>

              {/* Skills / Expertise Tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-2 mb-6">
                {mentor.expertise && (
                    <span className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full">
                        {mentor.expertise}
                    </span>
                )}
                {mentor.skills.slice(0, 2).map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>

              <Link
                href={`/profile/${mentor.id}`}
                className="w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors mt-auto"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
