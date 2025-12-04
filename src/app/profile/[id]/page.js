"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { User, BookOpen, Award, Clock, Users, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PublicProfilePage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${id}/profile`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        } else {
            // If mentor not found, redirect or show error
            // router.push("/mentors");
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-20 text-center">Mentor not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
            <ArrowLeft size={20} /> Back to Mentors
        </button>

        <div className="grid md:grid-cols-3 gap-8">
            {/* ---------------- LEFT COLUMN: INFO CARD ---------------- */}
            <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100 sticky top-10">
                <div className="relative w-32 h-32 mx-auto mb-4">
                <img 
                    src={profile.image || "https://placehold.co/150"} 
                    alt={profile.name} 
                    className="w-full h-full rounded-full object-cover border-4 border-red-50"
                />
                <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>

                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <div className="flex items-center justify-center gap-1 text-yellow-500 mt-1 text-sm font-medium">
                    <Award size={16} />
                    <span>{profile.avgRating} ({profile.totalReviews} reviews)</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 bg-gray-50 p-4 rounded-xl">
                <div className="text-center">
                    <div className="flex justify-center text-red-400 mb-1"><Users size={20} /></div>
                    <div className="font-bold text-gray-900 text-lg">
                    {profile.totalStudents}
                    </div>
                    <div className="text-xs text-gray-500">
                    Students
                    </div>
                </div>
                <div className="text-center border-l border-gray-200">
                    <div className="flex justify-center text-red-400 mb-1"><BookOpen size={20} /></div>
                    <div className="font-bold text-gray-900 text-lg">
                    {profile.totalCourses}
                    </div>
                    <div className="text-xs text-gray-500">
                    Courses
                    </div>
                </div>
                </div>

                <div className="mt-6">
                    <button className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded-xl font-medium shadow-sm shadow-red-100 transition-all">
                        Send Message
                    </button>
                </div>
            </div>
            </div>

            {/* ---------------- RIGHT COLUMN: DETAILS ---------------- */}
            <div className="md:col-span-2 space-y-6">
            
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">About Me</h2>
                <p className="text-gray-600 leading-relaxed">
                    {profile.bio || "This mentor hasn't written a bio yet."}
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs text-gray-400">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.expertise ? (
                                <span className="px-3 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">
                                    {profile.expertise}
                                </span>
                            ) : <span className="text-gray-400 text-sm">Not specified</span>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs text-gray-400">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                        {profile.skills?.split(',').map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium border border-gray-200">
                            {skill.trim()}
                            </span>
                        )) || <span className="text-gray-400 text-sm">No skills listed</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        Courses by {profile.name}
                    </h2>
                    <span className="text-sm text-gray-500">{profile.courses?.length} Courses</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {profile.courses?.map((course) => (
                        <div key={course.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-32 bg-gray-200 relative overflow-hidden">
                                <img 
                                    src={course.image || "https://placehold.co/400"} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                                <span className="absolute top-2 right-2 bg-red-400 text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                                    {course.level}
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{course.title}</h3>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                        <Star size={14} fill="currentColor" /> {course.rating || "0.0"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} /> {course.durationWeeks || 8} weeks
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users size={14} /> {course.studentCount}
                                    </div>
                                </div>

                                <Link 
                                    href={`/courses/${course.id}`}
                                    className="block w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-center text-sm rounded-lg font-medium transition-colors"
                                >
                                    View Course
                                </Link>
                            </div>
                        </div>
                    ))}

                    {(!profile.courses || profile.courses.length === 0) && (
                        <p className="text-gray-500 text-sm col-span-2 text-center py-4">No courses created yet.</p>
                    )}
                </div>
            </div>

            </div>
        </div>
      </div>
    </div>
  );
}
