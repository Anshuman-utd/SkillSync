
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, BookOpen, UserCheck, Award, TrendingUp, ArrowRight, Search, Star } from "lucide-react";
import { motion } from "framer-motion";

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const coursesRes = await fetch("/api/courses?featured=true&limit=3", { cache: "no-store" });
        const coursesData = await coursesRes.json();
        setFeaturedCourses(coursesData.courses || []);

        const mentorsRes = await fetch("/api/mentors");
        if (mentorsRes.ok) {
          const mentorsData = await mentorsRes.json();
          const shuffled = (mentorsData.mentors || []).sort(() => 0.5 - Math.random());
          setMentors(shuffled.slice(0, 3));
        }

      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans">

      {/* -------------------------------- HERO SECTION ------------------------------- */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 -mb-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-left"
          >
            <motion.div variants={fadeIn} className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-red-500 bg-red-100 rounded-full">
              🚀 Start your learning journey today
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold leading-tight text-gray-900 mb-6">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">True Potential</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Connect with world-class mentors, enroll in curated courses, and master new skills. Your future starts here.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                Explore Courses <ArrowRight size={20} />
              </Link>

              <Link
                href="/mentors"
                className="px-8 py-4 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold text-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300"
              >
                Find a Mentor
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="mt-12 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                    <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} width={40} height={40} alt="User" />
                  </div>
                ))}
              </div>
              <p><span className="font-bold text-gray-900">10k+</span> students are already learning</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden md:block"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
                width={800}
                height={600}
                alt="Students learning together"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-lg">Live Mentorship Sessions</p>
                <p className="text-sm opacity-80">Join daily live sessions with experts</p>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 bg-white p-4 rounded-xl shadow-xl z-20 max-w-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <UserCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Expert Verified</p>
                  <p className="text-xs text-gray-500">Top industry professionals</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl z-20 max-w-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Award size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Certificates</p>
                  <p className="text-xs text-gray-500">Earn while you learn</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* -------------------------------- STATS SECTION ------------------------------- */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Learners", value: "15,000+", icon: <Users size={24} /> },
              { label: "Expert Mentors", value: "500+", icon: <UserCheck size={24} /> },
              { label: "Total Courses", value: "1,200+", icon: <BookOpen size={24} /> },
              { label: "Success Rate", value: "98%", icon: <TrendingUp size={24} /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="text-red-400 mb-2">{stat.icon}</div>
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- FEATURED COURSES --------------------------- */}
      <section className="px-6 md:px-16 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-red-500 font-semibold tracking-wider uppercase text-sm">Disocver</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Featured Courses</h2>
            </div>
            <Link
              href="/courses"
              className="group flex items-center gap-2 text-gray-600 hover:text-red-500 font-medium transition-colors"
            >
              View All Courses <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course) => (
                <motion.div
                  whileHover={{ y: -5 }}
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={course.image}
                      width={600}
                      height={400}
                      alt={course.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < Math.floor(course.rating) ? "currentColor" : "none"} stroke="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{course.rating} (120 reviews)</span>
                    </div>

                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-red-500 transition-colors">{course.title}</h3>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                      {course.mentorImage ? (
                        <img src={course.mentorImage} alt={course.mentor} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-500">
                          {course.mentor?.[0]}
                        </div>
                      )}
                      <span className="font-medium">{course.mentor}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp size={16} />
                        <span>{course.level || "Beginner"}</span>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="text-red-500 font-bold text-sm hover:underline"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">No featured courses available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------- CATEGORIES SECTION ------------------------ */}
      <section className="px-6 md:px-16 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Top Categories</h2>
            <p className="text-gray-500 mt-4 text-lg">
              Find the right path for your career with our diverse range of course categories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              ["💻", "Web Dev", 245, "bg-blue-50 text-blue-600"],
              ["🎨", "UI/UX", 182, "bg-purple-50 text-purple-600"],
              ["🤖", "AI & ML", 156, "bg-green-50 text-green-600"],
              ["☁️", "Cloud", 128, "bg-sky-50 text-sky-600"],
              ["📱", "Mobile", 198, "bg-orange-50 text-orange-600"],
              ["📊", "Data", 174, "bg-pink-50 text-pink-600"],
            ].map(([icon, name, count, colorClass]) => (
              <Link
                href={`/courses?category=${name}`}
                key={name}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border border-transparent hover:border-gray-200 hover:shadow-lg transition-all group ${colorClass} bg-opacity-50 hover:bg-opacity-100`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{icon}</div>
                <h3 className="font-bold text-gray-900">{name}</h3>
                <p className="text-gray-500 text-xs mt-1 font-medium">{count} Courses</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- MEET OUR MENTORS ------------------------ */}
      <section className="px-6 md:px-16 py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-1/2 h-full  to-transparent opacity-50"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn from the Best</h2>
              <p className="text-gray-400 max-w-xl text-lg">
                Our mentors are industry experts from top companies ready to guide you.
              </p>
            </div>
            <Link href="/mentors" className="mt-6 md:mt-0 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/30">
              View All Mentors
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-gray-800 p-8 rounded-3xl text-center border border-gray-700 hover:border-gray-600 hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <img
                    src={mentor.image || "https://placehold.co/150x150?text=Mentor"}
                    alt={mentor.name}
                    className="w-full h-full rounded-full object-cover border-4 border-gray-700 shadow-xl"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-800"></div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{mentor.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{mentor.title || "Senior Instructor"}</p>

                <div className="flex justify-center gap-2 mb-8">
                  {mentor.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/profile/${mentor.id}`}
                  className="inline-block w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}

            {mentors.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <p>Loading mentors...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------- WHY CHOOSE SKILLSYNC ------------------------ */}
      <section className="px-6 md:px-16 py-24 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Students Love SkillSync</h2>
            <p className="text-gray-500 mt-4">We provide everything you need to boost your career.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-10">
            {[
              { icon: <BookOpen className="w-10 h-10" />, title: "Curated Content", desc: "Top-tier courses designed by experts for effective learning." },
              { icon: <UserCheck className="w-10 h-10" />, title: "1-on-1 Mentorship", desc: "Get personalized guidance from industry professionals." },
              { icon: <Award className="w-10 h-10" />, title: "Certification", desc: "Earn certificates to showcase your skills to employers." },
              { icon: <TrendingUp className="w-10 h-10" />, title: "Career Growth", desc: "Practical skills that directly impact your career trajectory." },
            ].map((item, i) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm transform rotate-3 group-hover:rotate-0 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
