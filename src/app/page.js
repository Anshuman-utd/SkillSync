
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";

   

export default function Home() {
  const [user, setUser] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const data = await authRes.json();
          setUser(data.user);
        }

        const coursesRes = await fetch("/api/courses?featured=true&limit=3", { cache: "no-store" });
        const coursesData = await coursesRes.json();
        setFeaturedCourses(coursesData.courses || []);

        // Fetch Mentors
        const mentorsRes = await fetch("/api/mentors");
        if (mentorsRes.ok) {
            const mentorsData = await mentorsRes.json();
            // Randomly select 3 mentors
            const shuffled = (mentorsData.mentors || []).sort(() => 0.5 - Math.random());
            setMentors(shuffled.slice(0, 3));
        }

      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }
    fetchData();
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
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden p-3 relative group hover:shadow-lg transition-all">
                <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                    src={course.image}
                    width={600}
                    height={400}
                    alt={course.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 bg-red-400 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                    {course.category}
                    </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    {course.mentorImage ? (
                        <img src={course.mentorImage} alt={course.mentor} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {course.mentor?.[0]}
                        </div>
                    )}
                    <span>{course.mentor}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Users size={14} />
                    <span>{course.studentCount || 0} students</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span className="font-medium text-gray-900">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>⏳</span>
                        <span>{course.duration}</span>
                    </div>
                  </div>

                  <Link 
                    href={`/courses/${course.id}`}
                    className="block w-full bg-gray-900 text-white text-center py-2.5 rounded-lg font-medium hover:bg-gray-800 transition shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 text-gray-500">
                No featured courses available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------- CATEGORIES SECTION ------------------------ */}
      <section className="px-6 md:px-16 py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-500 mt-2">
            Explore courses across various domains
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ["💻", "Web Dev", 245],
            ["🎨", "UI/UX", 182],
            ["🤖", "AI & ML", 156],
            ["☁️", "Cloud", 128],
            ["📱", "Mobile", 198],
            ["📊", "Data", 174],
          ].map(([icon, name, count]) => (
            <Link
              href={`/courses?category=${name}`}
              key={name}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md hover:bg-red-50 transition-all group cursor-pointer"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
              <p className="text-gray-400 text-xs mt-1">{count} courses</p>
            </Link>
          ))}
        </div>
      </section>

      {/* -------------------------------- MEET OUR MENTORS ------------------------ */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Meet Our Mentors</h2>
                <p className="text-gray-500 mt-2">Learn from industry-leading experts</p>
            </div>
            <Link href="/mentors" className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                View All Mentors
            </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
                <div key={mentor.id} className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <img 
                            src={mentor.image || "https://placehold.co/150x150?text=Mentor"} 
                            alt={mentor.name}
                            className="w-full h-full rounded-full object-cover border-4 border-red-50"
                        />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1 text-yellow-500 font-medium">
                            ⭐ {mentor.avgRating || "5.0"}
                        </span>
                        <span>({mentor.totalStudents || 0} students)</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {mentor.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>

                    <Link 
                        href={`/profile/${mentor.id}`}
                        className="block w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        View Profile
                    </Link>
                </div>
            ))}
            {mentors.length === 0 && (
                 <div className="col-span-3 text-center py-10 text-gray-500">
                    Loading mentors...
                </div>
            )}
        </div>
      </section>

      {/* -------------------------------- WHY CHOOSE SKILLSYNC ------------------------ */}
      <section className="px-6 md:px-16 py-24 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose SkillSync?</h2>
        <p className="text-gray-500 mb-16">Everything you need to succeed in your learning journey</p>

        <div className="grid md:grid-cols-4 gap-8">
            {[
                { icon: "📖", title: "Curated Content", desc: "Access carefully selected courses and resources" },
                { icon: "👥", title: "Expert Mentors", desc: "Connect with industry professionals" },
                { icon: "🏵️", title: "Certificates", desc: "Earn recognized certificates upon completion" },
                { icon: "📈", title: "Track Progress", desc: "Monitor your learning journey in real-time" },
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center text-3xl text-red-500 mb-6">
                        {item.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
                </div>
            ))}
        </div>
      </section>

    </div>
  );
}
